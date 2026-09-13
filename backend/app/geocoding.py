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

    Tries the full address first. Nominatim is strict about phrasing, so if the
    precise address can't be resolved, this falls back to just the district +
    city, giving at least an approximate pin instead of nothing. Returns
    (None, None) only if even the district-level fallback fails.
    """
    # Attempt 1: full address, most precise
    full_query_parts = [address]
    if district:
        full_query_parts.append(district)
    full_query_parts.append(city)
    full_query_parts.append(country)
    full_query = ", ".join(full_query_parts)

    lat, lon = _query_nominatim(full_query)
    if lat is not None:
        return lat, lon

    # Attempt 2: fallback to just district + city, if a district was given
    if district:
        fallback_query = f"{district}, {city}, {country}"
        lat, lon = _query_nominatim(fallback_query)
        if lat is not None:
            return lat, lon

    # Attempt 3: last resort, just the city
    return _query_nominatim(f"{city}, {country}")