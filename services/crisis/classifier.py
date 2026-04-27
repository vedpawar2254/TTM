"""Keyword-based crisis risk classifier."""

from resources import CRISIS_RESOURCES

# Immediate danger — triggers hard stop
_HIGH_RISK: list[str] = [
    "kill myself", "end my life", "suicide", "want to die",
    "going to die", "can't go on", "better off dead",
    "hurt myself", "self harm", "cut myself", "overdose",
    "take my life",
]

# Concerning but not immediately dangerous
_MEDIUM_RISK: list[str] = [
    "don't want to be here", "disappear", "give up",
    "can't take it anymore", "no reason to live",
    "worthless", "nobody cares", "burden to everyone",
]


def classify_crisis_risk(message: str) -> dict:
    """Return {risk, probability, resources}.

    risk: 'high' | 'medium' | 'low'
    resources: populated on medium/high so caller can surface them.
    """
    text = message.lower()
    high_hits = sum(1 for kw in _HIGH_RISK if kw in text)
    medium_hits = sum(1 for kw in _MEDIUM_RISK if kw in text)

    if high_hits:
        return {
            "risk": "high",
            "probability": min(1.0, 0.6 + high_hits * 0.2),
            "resources": CRISIS_RESOURCES,
        }
    if medium_hits:
        return {
            "risk": "medium",
            "probability": min(0.7, 0.3 + medium_hits * 0.1),
            "resources": CRISIS_RESOURCES,
        }
    return {"risk": "low", "probability": 0.0, "resources": {}}
