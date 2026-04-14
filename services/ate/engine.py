"""Adaptive Therapy Engine scaffold."""


def choose_modality(emotion_label: str) -> str:
    """Return a placeholder modality selection."""
    mapping = {
        "anger": "validation",
        "sadness": "journaling",
        "anxiety": "mindfulness",
        "looping_thoughts": "cbt",
        "goal_oriented": "sfbt",
        "existential": "narrative",
    }
    return mapping.get(emotion_label, "validation")
