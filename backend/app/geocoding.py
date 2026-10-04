import logging
import requests

logger = logging.getLogger(__name__)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"


def _query_nominatim(query: str):
    """Executes a single geocoding query against Nominatim with error logging."""
    try:
        response = requests.get(
            NOMINATIM_URL,
            params={"q": query, "format": "json", "limit": 1},
            headers={"User-Agent": "CoLiving-App/1.0 (student project - contact@example.com)"},
            timeout=5,
        )
        response.raise_for_status()
        results = response.json()
        if results:
            return float(results[0]["lat"]), float(results[0]["lon"])
    except requests.exceptions.RequestException as e:
        logger.warning(f"[Geocoding] Nominatim request failed for '{query}': {e}")
    except Exception as e:
        logger.error(f"[Geocoding] Unexpected error for '{query}': {e}")
    return None, None


def geocode_address(address: str, district: str = None, city: str = "Baku", country: str = "Azerbaijan"):
    """
    Converts a free-text address into (latitude, longitude) using Nominatim.
    Filters out invalid placeholders like 'Select an option' and handles fallback queries.
    """
    clean_address = address.strip() if address else ""
    if not clean_address:
        return None, None

    # Filter out invalid placeholder values sent from the frontend
    invalid_districts = {None, "", "null", "none", "select an option", "select option"}
    clean_district = None
    if district and str(district).strip().lower() not in invalid_districts:
        clean_district = str(district).strip()

    # Build search query fallback hierarchy from specific to broad
    queries_to_try = []

    # 1. Specific query with address and district (if a valid district is provided)
    if clean_district and clean_district.lower() != clean_address.lower():
        queries_to_try.append(f"{clean_address}, {clean_district}, {city}, {country}")

    # 2. Primary query: address + city
    queries_to_try.append(f"{clean_address}, {city}")

    # 3. District fallback: district + city
    if clean_district:
        queries_to_try.append(f"{clean_district}, {city}, {country}")

    # 4. Final resort: city + country
    queries_to_try.append(f"{city}, {country}")

    # Execute queries sequentially, ignoring duplicate strings
    seen_queries = set()
    for query in queries_to_try:
        if query in seen_queries:
            continue
        seen_queries.add(query)

        lat, lon = _query_nominatim(query)
        if lat is not None:
            return lat, lon

    return None, None
