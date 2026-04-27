"""Keyword-based emotion scoring."""

import re

_KEYWORDS: dict[str, list[str]] = {
    "anger": [
        "angry", "furious", "rage", "mad", "frustrated", "irritated",
        "annoyed", "livid", "hate", "resentful", "bitter",
    ],
    "sadness": [
        "sad", "depressed", "hopeless", "miserable", "heartbroken",
        "lonely", "grief", "crying", "tears", "devastated", "unhappy",
        "down", "low", "blue", "empty", "numb",
    ],
    "anxiety": [
        "anxious", "worried", "nervous", "stressed", "panic", "fear",
        "scared", "overwhelmed", "dread", "uneasy", "tense", "restless",
    ],
    "looping_thoughts": [
        "can't stop thinking", "keep thinking", "obsessing", "ruminating",
        "going in circles", "stuck", "repeating", "intrusive",
    ],
    "goal_oriented": [
        "want to", "trying to", "working on", "goal", "achieve",
        "improve", "plan", "progress", "better", "change",
    ],
    "existential": [
        "meaning", "purpose", "worth it", "why bother", "pointless",
        "lost", "identity", "existence", "who am i",
    ],
}


def score_lexical_signal(message: str) -> dict[str, float]:
    """Return per-emotion keyword density scores in [0, 1]."""
    text = message.lower()
    word_count = len(re.findall(r"\w+", text)) or 1
    return {
        label: min(1.0, sum(1 for kw in kws if kw in text) / word_count * 10)
        for label, kws in _KEYWORDS.items()
        if any(kw in text for kw in kws)
    }
