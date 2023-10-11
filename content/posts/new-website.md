---
title: 'New Website'
date: '2023-10-11T13:37:09+01:00'
publishdate: '2023-10-12'
draft: false
---

I decided it was about time to refresh my personal website. Last week, I lead a meeting with colleagues about academic websites and how to build your own with GitHub pages (see [notes](https://github.com/alexlyttle/academic-website)). However, I realised that it had been a while since I had updated my own and wanted a change.

I decided to use the [Hugo](https://gohugo.io/) static site generator. Written in [Go](https://go.dev/), Hugo is a pretty lightweight, fast and easy-to-use framework. With Hugo, it is easy and encouraged to implement a website theme from the open source community. After browsing numerous themes, I settled on [PaperMod](https://github.com/adityatelange/hugo-PaperMod) because it had good documentation for a Hugo beginner like me.

After experimenting with the theme, I made a few tweaks to suit an academic website. The main one was to add a list of publications. Then, I customised the theme template to work with the publications.

## Updating Publications

I wanted a way to automate adding my publications to the website. NASA provides an Abstract Data Service (ADS) with a useful [API](https://ui.adsabs.harvard.edu/help/api/). Combined with an open-source Python package called [`ads`](https://github.com/andycasey/ads), this makes downloading bibliographic data straightforward. I wrote a Python [script](https://github.come/alexlyttle/alexlyttle.github.io/scripts/update_pubs.py) which uses the ADS API to download the bibliography associated with my [ORCID](https://orcid.org/). Here is a summary of what the script does:

1. Using the `ads` package, request a BibTeX file from the ADS API containing data for publications not yet added to the website.

    - Check to see if publication exists.

        ```python
        def publication_exists(bibcode: str) -> bool:
            """Check if publication already exists in publication directory."""
            # This assumes the citation key is the same as the bibcode
            return os.path.exists(os.path.join(PUB_DIR, f"{bibcode}.md"))
        ```

    - Export BibTeX file for ADS entries associated with an ORCID.

        ```python
        def export_bibtex(orcid: str) -> str:
            """Export bibtext file for search result from ADS."""
            search_query = ads.SearchQuery(fl=["bibcode"], orcid=orcid, rows=ROWS)
            publications = [
                row for row in search_query if not publication_exists(row.bibcode)
            ]
            bibcodes = [pub.bibcode for pub in publications]
            fmt = "bibtexabs"  # BibTeX with abstract
            ads.ExportQuery.FORMATS.append(fmt)  # hack to add to valid formats
            exp = ads.ExportQuery(bibcodes, fmt)
        return exp.execute()
        ```

    - You could adapt this to a different search query (E.g. name and date range).

2. Parse the BibTeX file with the [`bibtexparser`](https://bibtexparser.readthedocs.io/en/main/) package.

    ```python
    bibtex = export_bibtex(ORCID)
    library = bibtexparser.parse_string(bibtex)
    ```

3. Get data from a library entry and convert it from LaTeX to unicode using the `latex2text` module of the [`pylatexenc`](https://github.com/phfaist/pylatexenc) package. 

    - Since the ADS API uses the [AASTeX macros](https://ui.adsabs.harvard.edu/help/actions/journal-macros) for journal names, add these to `latex2text`. This uses a [custom JSON file](https://github.com/alexlyttle/alexlyttle.github.io/data/) I made which maps the macro names to their journal names.

        ```python
        # Load AAS macros
        with open(MACROS_PATH) as file:
            # Add some security checks if needed
            aas_macros = json.loads(file.read())

        # Add AAS macros to latex2text
        macros = [
            latex2text.MacroTextSpec(key, simplify_repl=value) for key, value in aas_macros.items()
        ]
        latex_context = latex2text.get_default_latex_context_db()
        latex_context.add_context_category("aas_macros", prepend=True, macros=macros)

        # Create latex_to_text function
        latex_to_text = latex2text.LatexNodes2Text(latex_context=latex_context).latex_to_text
        ```
    
    - Get fields by their key name.

        ```python
        def get_field(entry: Entry, key: str) -> str:
            """Get field from bibtex entry or return None if not found."""
            if key in entry.fields_dict:
                latex = entry.fields_dict[key].value
                return latex_to_text(latex)
            return None
        ```
    
    - Some fields need a bit more processing. For example, the BibTeX entry has a `year` and `month` field which we want to convert to a full date. To do this, I make use of the inbuilt `datetime` package.

        ```python
        def get_date(entry: Entry) -> str:
            """Get date from bibtex entry or return empty string if not found."""
            year = get_field(entry, "year")
            month = get_field(entry, "month")
            if year is None and month is None:
                return ""
            if month is None:
                month = "jan"
            return datetime.strptime(f"{year}-{month}", "%Y-%b").strftime("%Y-%m-%d")
        ```

    - Put it all together into one function:

        ```python
        def get_metadata(entry: Entry) -> dict:
            """Get metadata from bibtex entry."""
            metadata = {
                "title": get_field(entry, "title"),
                "authors": get_authors(entry),
                "date": get_date(entry),
                "journal": get_field(entry, "journal"),
                "abstract": get_field(entry, "abstract"),
                "tags": get_tags(entry),
                "doi": get_field(entry, "doi"),
                "adsurl": get_field(entry, "adsurl"),
                "adsnote": get_field(entry, "adsnote"),
                "publication_type": entry.entry_type,
                "bibcode": entry.key,
            }
            return metadata
        ```

4. Loop through each entry in the BibTeX library and gather metadata for the front matter of the publication post.

    - Create a publication file containing the metadata in YAML format using the `yaml` package.

        ```python
        def create_publication(filename: str, metadata: dict):
            """Create publication markdown file from entry metatdata."""
            with open(filename, "w") as file:
                file.write("---\n")
                file.write(yaml.dump(metadata, sort_keys=False))
                file.write("---\n")
        ```

    - Loop through each entry in the BibTeX library and create a publication using the citation key for that entry.

        ```python
        for entry in library.entries:
            metadata = get_metadata(entry)
            filename = os.path.join(PUB_DIR, f"{entry.key}.md")
            create_publication(filename, metadata)
        ```

## Styling publications

I wanted publication entries to show the author list, abstract, and other details like the DOI and ADS URL. Here are some examples of the changes I made to the PaperMod theme.

### Author List

For the author list, I learn't how to use Hugo templating to loop through the authors and print up to a maximum amount. See this code snippet from the `layouts/_default/list.html` file:

```html
<!-- if authors exist -->
{{- if .Params.authors }}
<p>
    <!-- set max number of authors -->
    {{- $maxAuthors := 5 }}
    {{- with .Params.authors }}
    <!-- count total number of authors in list -->
    {{- $authorCount := len . }}
    <!-- loop through authors -->
    {{- range $index, $author := . }}
        <!-- print author if less than max authors -->
        {{- if lt $index $maxAuthors }}
        <!-- separate with comma if not first author -->
        <!-- separate with 'and' if max author is also last author -->
        {{- if ne $index 0 }}, {{ end }}{{ if (and (eq $authorCount $maxAuthors) (eq $index (sub $authorCount 1))) }}and {{ end }}{{ $author }}
        <!-- display 'et al' if exceeding max authors -->
        {{- else if eq $index $maxAuthors }}
        et al
        {{- end -}}
    {{- end -}}
    .
    {{- end -}}
</p>
{{- end }}
```

### Badges

I used [sheilds.io](https://shields.io/) to create static badges for the DOI and ADS URL. They look like this:

![NASA ADS Badge](https://img.shields.io/badge/NASA_ADS-<bibcode>-blue) ![DOI Badge](https://img.shields.io/badge/DOI-<doi>-red) 

Then I found this awesome [Citation Badge](https://juleskreuer.eu/projekte/citation-badge/) project which queries Google Scholar for the number of citations to a particular DOI. For example,

![Citation Badge](https://api.juleskreuer.eu/citation-badge.php?doi=10.1126/science.1058040)
