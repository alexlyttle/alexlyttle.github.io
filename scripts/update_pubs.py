import os, json, ads, bibtexparser, yaml
from bibtexparser.model import Entry
from pylatexenc import latex2text
from datetime import datetime

# Set constants
# TODO: Add argument parser to script
ORCID = "0000-0001-8355-8082"
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

def export_bibtex(orcid: str) -> str:
    """Export bibtext file for search result from ADS."""
    search_query = ads.SearchQuery(fl=["bibcode"], orcid=orcid, rows=ROWS)
    publications = [row for row in search_query if not publication_exists(row.bibcode)]
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
    return text.split(", ")

def get_date(entry: Entry) -> str:
    """Get date from bibtex entry or return empty string if not found."""
    year = get_field(entry, "year")
    month = get_field(entry, "month")
    if year is None and month is None:
        return ""
    if month is None:
        month = "jan"
    return datetime.strptime(f"{year}-{month}", "%Y-%b").strftime("%Y-%m-%d")

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
        "publishdate": datetime.now().strftime("%Y-%m-%d"),
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
    bibtex = export_bibtex(ORCID)
    library = bibtexparser.parse_string(bibtex)
    for entry in library.entries:
        metadata = get_metadata(entry)
        filename = os.path.join(PUB_DIR, f"{entry.key}.md")
        create_publication(filename, metadata)

if __name__ == "__main__":
    main()

