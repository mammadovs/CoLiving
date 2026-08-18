from app import models

# Weight per field — higher = matters more for compatibility
WEIGHTS = {
    "sleep_schedule": 15,
    "cleanliness_level": 20,
    "religion": 15,
    "noise_tolerance": 15,
    "smoking_habit": 10,
    "drinks_alcohol": 10,
    "pet_friendly": 5,
    "guest_frequency": 5,
    "work_or_study_schedule": 5,
    "personality_type": 5,
    "budget": 10,
}

TOTAL_WEIGHT = sum(WEIGHTS.values())  # should sum to 100+ if budget counted separately; we normalize below


def _field_score(user_a, user_b, field: str) -> float:
    """Returns 1.0 (full match), 0.5 (partial/unknown), or 0.0 (mismatch) for a given field."""
    val_a = getattr(user_a, field, None)
    val_b = getattr(user_b, field, None)

    # If either user hasn't filled this field in, treat as neutral (partial credit)
    if val_a is None or val_b is None:
        return 0.5

    return 1.0 if val_a == val_b else 0.0


def _budget_score(user_a, user_b) -> float:
    """Budget compatibility based on how close the two numbers are, not exact match."""
    b_a, b_b = user_a.budget, user_b.budget

    if b_a is None or b_b is None:
        return 0.5

    b_a, b_b = float(b_a), float(b_b)
    if b_a == 0 and b_b == 0:
        return 1.0

    diff_ratio = abs(b_a - b_b) / max(b_a, b_b)

    if diff_ratio <= 0.10:
        return 1.0
    elif diff_ratio <= 0.25:
        return 0.7
    elif diff_ratio <= 0.50:
        return 0.4
    else:
        return 0.0


def calculate_compatibility(user_a: models.User, user_b: models.User) -> dict:
    breakdown = {}
    weighted_sum = 0.0

    for field, weight in WEIGHTS.items():
        if field == "budget":
            score = _budget_score(user_a, user_b)
        else:
            score = _field_score(user_a, user_b, field)

        breakdown[field] = round(score * 100)
        weighted_sum += score * weight

    percentage = round((weighted_sum / TOTAL_WEIGHT) * 100)

    return {
        "compatibility_score": percentage,
        "breakdown": breakdown,
    }