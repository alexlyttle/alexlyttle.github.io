import os, json, ads, bibtexparser, yaml
from bibtexparser.model import Entry
from pylatexenc import latex2text
from datetime import datetime

# Set constants
# TODO: Add argument parser to script
QUERY = {
    "q": "docs(library/P5v-VYFUSjiw1c_tQ210LQ)",  # set this to your library
}
MACROS_PATH = "data/aas_macros.json"
ROWS = 50
PUB_DIR = "content/publications"

# Check publication directory exists
if not os.path.isdir(PUB_DIR):
    os.makedirs(PUB_DIR)

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

def publication_exists(bibcode: str) -> bool:
    """Check if publication already exists in publication directory."""
    # This assumes the citation key is the same as the bibcode
    return os.path.exists(os.path.join(PUB_DIR, f"{bibcode}.md"))

def export_bibtex(query: str) -> str:
    """Export bibtext file for search result from ADS."""
    search_query = ads.SearchQuery(fl=["bibcode"], rows=ROWS, **query)
    publications = [row for row in search_query if not publication_exists(row.bibcode)]
    if len(publications) == 0:
        return ""
    bibcodes = [pub.bibcode for pub in publications]
    fmt = "bibtexabs"
    ads.ExportQuery.FORMATS.append(fmt)  # hack to add to valid formats
    exp = ads.ExportQuery(bibcodes, fmt)
    return exp.execute()

def get_field(entry: Entry, key: str) -> str:
    """Get field from bibtex entry or return None if not found."""
    if key in entry.fields_dict:
        latex = entry.fields_dict[key].value
        return latex_to_text(latex)
    return None

def get_authors(entry: Entry) -> list:
    """Get list of authors from bibtex entry or return empty list if not found."""
    text = get_field(entry, "author")
    if text is None:
        return []
    authors = text.split(" and ")
    # ADS puts name suffixes like Jr. after the given name
    # ADS formats names as Family, Given M., Suffix
    for i, author in enumerate(authors):
        names = author.split(", ")
        if len(names) == 1:
            continue
        fullname = " ".join([names[1], names[0]])
        authors[i] = ", ".join([fullname, *names[2:]])
    return authors

def get_tags(entry: Entry) -> list:
    """Get list of tags from bibtex entry or return empty list if not found."""
    text = get_field(entry, "keywords")
    if text is None:
        return []
    # Remove digits from keywords
    return [keyword for keyword in text.split(", ") if not keyword.isdigit()]

def get_date(entry: Entry) -> str:
    """Get date from bibtex entry or return empty string if not found."""
    year = get_field(entry, "year")
    month = get_field(entry, "month")
    if year is None and month is None:
        return ""
    if month is None:
        month = "jan"
    return datetime.strptime(f"{year}-{month}", "%Y-%b").strftime("%Y-%m-%d")

def get_categories(entry: Entry) -> list:
    """So far only returns the article type as a category."""
    category = entry.entry_type
    if category.startswith("in"):
        words = ["in", category[2:]]
    elif category.endswith("thesis"):
        words = [category[:-6], "thesis"]
    elif category == "misc":
        words = ["miscellaneous"]
    elif category == "techreport":
        words = ["technical", "report"]
    else:
        words = [category]
    return [" ".join(word.capitalize() for word in words)]

def get_metadata(entry: Entry) -> dict:
    """Get metadata from bibtex entry."""
    metadata = {
        "title": get_field(entry, "title"),
        "author": get_authors(entry),
        "date": get_date(entry),
        "publishdate": datetime.now().strftime("%Y-%m-%d"),  # This is the date the file was created
        "description": get_field(entry, "abstract"),
        "tags": get_tags(entry),
        "categories": get_categories(entry),
        "journal": get_field(entry, "journal"),
        "doi": get_field(entry, "doi"),
        "adsurl": get_field(entry, "adsurl"),
        "adsnote": get_field(entry, "adsnote"),
        "publication_type": entry.entry_type,
        "bibcode": entry.key,
    }
    return metadata

def create_publication(filename: str, metadata: dict):
    """Create publication markdown file from entry metatdata."""
    with open(filename, "w") as file:
        file.write("---\n")
        file.write(yaml.dump(metadata, sort_keys=False))
        file.write("---\n")

def main():
    """Main function."""
    bibtex = export_bibtex(QUERY)
    library = bibtexparser.parse_string(bibtex)
    for entry in library.entries:
        metadata = get_metadata(entry)
        filename = os.path.join(PUB_DIR, f"{entry.key}.md")
        create_publication(filename, metadata)

if __name__ == "__main__":
    main()

