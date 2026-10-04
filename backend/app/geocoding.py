import logging
import re
import requests

logger = logging.getLogger(__name__)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
PHOTON_URL = "https://photon.komoot.io/api/"

HEADERS = {
    "User-Agent": "CoLivingBakuApp/1.0 (mammadov.coliving.app@gmail.com)",
    "Accept-Language": "en,az,ru",
}

# Local database of coordinates for Baku districts, metro stations, and landmarks
BAKU_KNOWN_LOCATIONS = {
    "narimanov": (40.4026, 49.8707),
    "nerimanov": (40.4026, 49.8707),
    "nərimanov": (40.4026, 49.8707),
    "yasamal": (40.3772, 49.8093),
    "nasimi": (40.3853, 49.8398),
    "nesimi": (40.3853, 49.8398),
    "nəsimi": (40.3853, 49.8398),
    "khatai": (40.3846, 49.8972),
    "xatai": (40.3846, 49.8972),
    "xətai": (40.3846, 49.8972),
    "sabail": (40.3582, 49.8291),
    "səbail": (40.3582, 49.8291),
    "nizami": (40.4167, 49.9234),
    "sabunchu": (40.4489, 49.9482),
    "sabuncu": (40.4489, 49.9482),
    "sabunçu": (40.4489, 49.9482),
    "binagadi": (40.4633, 49.8267),
    "bineqedi": (40.4633, 49.8267),
    "binəqədi": (40.4633, 49.8267),
    "surakhani": (40.4286, 50.0053),
    "suraxani": (40.4286, 50.0053),
    "suraxanı": (40.4286, 50.0053),
    "khazar": (40.4481, 50.1583),
    "xezer": (40.4481, 50.1583),
    "xəzər": (40.4481, 50.1583),
    "garadagh": (40.2858, 49.6383),
    "qaradag": (40.2858, 49.6383),
    "qaradağ": (40.2858, 49.6383),
    "pirallahi": (40.4667, 50.3333),
    "28 may": (40.3798, 49.8486),
    "sahil": (40.3700, 49.8422),
    "elmler": (40.3736, 49.8105),
    "iceri seher": (40.3661, 49.8332),
    "icherisheher": (40.3661, 49.8332),
    "genclik": (40.4001, 49.8516),
    "gənclik": (40.4001, 49.8516),
}

DEFAULT_BAKU_COORDS = (40.4093, 49.8671)


def _check_local_dictionary(text: str, exact_only: bool = False):
    """Fast match lookup against local Baku location database using word boundaries."""
    if not text:
        return None, None
    clean_text = text.lower().strip()

    # Exact match check
    if clean_text in BAKU_KNOWN_LOCATIONS:
        return BAKU_KNOWN_LOCATIONS[clean_text]

    if exact_only:
        return None, None

    # Word boundary match to prevent false positives (e.g. 'baki' matching 'bakikhanov')
    for key, coords in BAKU_KNOWN_LOCATIONS.items():
        if re.search(rf"\b{re.escape(key)}\b", clean_text):
            return coords

    return None, None


def _query_photon(query: str):
    """Fallback geocoding via Photon API (Komoot) with custom headers."""
    try:
        clean_q = query.replace(",", " ").strip()
        response = requests.get(
            PHOTON_URL,
            params={"q": clean_q, "limit": 1},
            headers=HEADERS,
            timeout=4,
        )
        if response.status_code == 200:
            data = response.json()
            features = data.get("features", [])
            if features:
                coords = features[0]["geometry"]["coordinates"]
                return float(coords[1]), float(coords[0])
    except Exception as e:
        logger.warning(f"[Geocoding] Photon request failed for '{query}': {e}")
    return None, None


def _query_nominatim(query: str):
    """Primary query to Nominatim with a Photon API fallback."""
    try:
        response = requests.get(
            NOMINATIM_URL,
            params={"q": query, "format": "json", "limit": 1},
            headers=HEADERS,
            timeout=4,
        )
        if response.status_code == 200:
            results = response.json()
            if results:
                return float(results[0]["lat"]), float(results[0]["lon"])
    except Exception as e:
        logger.warning(f"[Geocoding] Nominatim request failed for '{query}': {e}")

    return _query_photon(query)


def geocode_address(address: str, district: str = None, city: str = "Baku", country: str = "Azerbaijan"):
    """
    Main geocoding handler with robust fallback mechanism.
    """
    clean_address = address.strip() if address else ""
    if not clean_address:
        return None, None

    invalid_districts = {None, "", "null", "none", "select an option", "select option"}
    clean_district = None
    if district and str(district).strip().lower() not in invalid_districts:
        clean_district = str(district).strip()

    # Step 1: Check exact match in local dictionary for short queries (e.g. "Narimanov")
    lat, lon = _check_local_dictionary(clean_address, exact_only=True)
    if lat is not None:
        return lat, lon

    # Step 2: Try external APIs (Nominatim -> Photon) for exact street/building accuracy
    queries_to_try = [
        f"{clean_address} {clean_district or ''} {city}".strip(),
        f"{clean_address} {city}",
        clean_address,
    ]

    seen = set()
    for q in queries_to_try:
        if q in seen:
            continue
        seen.add(q)

        lat, lon = _query_nominatim(q)
        if lat is not None:
            return lat, lon

    # Step 3: Local dictionary keyword fallback if APIs were blocked or found nothing
    lat, lon = _check_local_dictionary(clean_address)
    if lat is not None:
        return lat, lon

    if clean_district:
        lat, lon = _check_local_dictionary(clean_district)
        if lat is not None:
            return lat, lon

    # Step 4: Final fallback to Baku city center default coordinates
    return DEFAULT_BAKU_COORDS
