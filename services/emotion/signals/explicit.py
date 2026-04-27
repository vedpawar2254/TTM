"""Explicit self-report signal — detects 'I feel X' style statements."""

import re

_PATTERN = re.compile(
    r"\b(?:i feel|i am|i'm|i've been|i've felt|feeling|i get)\s+(\w+)",
    re.IGNORECASE,
)

_WORD_TO_LABEL: dict[str, str] = {
    "angry": "anger", "mad": "anger", "furious": "anger",
    "frustrated": "anger", "irritated": "anger", "annoyed": "anger",
    "sad": "sadness", "depressed": "sadness", "hopeless": "sadness",
    "lonely": "sadness", "devastated": "sadness", "miserable": "sadness",
    "heartbroken": "sadness", "down": "sadness",
    "anxious": "anxiety", "nervous": "anxiety", "stressed": "anxiety",
    "overwhelmed": "anxiety", "scared": "anxiety", "worried": "anxiety",
    "panicky": "anxiety",
    "lost": "existential", "empty": "existential", "numb": "existential",
}


def score_explicit_signal(message: str) -> dict[str, float]:
    """Return per-emotion score [0, 1] from explicit self-reports."""
    scores: dict[str, float] = {}
    for word in _PATTERN.findall(message):
        label = _WORD_TO_LABEL.get(word.lower())
        if label:
            scores[label] = min(1.0, scores.get(label, 0.0) + 0.8)
    return scores
