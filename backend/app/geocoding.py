import requests

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"


def _query_nominatim(query: str):
    """Runs a single geocoding query against Nominatim. Returns (lat, lon) or (None, None)."""
    try:
        response = requests.get(
            NOMINATIM_URL,
            params={"q": query, "format": "json", "limit": 1},
            headers={"User-Agent": "CoLiving-App/1.0 (student project)"},
            timeout=5,
        )
        response.raise_for_status()
        results = response.json()
        if not results:
            return None, None
        return float(results[0]["lat"]), float(results[0]["lon"])
    except Exception:
        return None, None


def geocode_address(address: str, district: str = None, city: str = "Baku", country: str = "Azerbaijan"):
    """
    Converts a free-text address into (latitude, longitude) using OpenStreetMap's
    free Nominatim geocoding service.

    Nominatim is picky about phrasing, so this tries queries from simplest to
    most specific, then falls back to district/city level if none resolve.
    Returns (None, None) only if even the city-level fallback fails.
    """
    # Attempt 1: simple "address, city" — works best for landmarks/malls
    lat, lon = _query_nominatim(f"{address}, {city}")
    if lat is not None:
        return lat, lon

    # Attempt 2: full address with district and country included
    full_query_parts = [address]
    if district:
        full_query_parts.append(district)
    full_query_parts.append(city)
    full_query_parts.append(country)
    lat, lon = _query_nominatim(", ".join(full_query_parts))
    if lat is not None:
        return lat, lon

    # Attempt 3: fallback to just district + city, if a district was given
    if district:
        lat, lon = _query_nominatim(f"{district}, {city}, {country}")
        if lat is not None:
            return lat, lon

    # Attempt 4: last resort, just the city
    return _query_nominatim(f"{city}, {country}")