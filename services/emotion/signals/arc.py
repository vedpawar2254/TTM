"""Conversation-arc signal — detects emotional consistency across recent turns."""

from signals.lexical import score_lexical_signal


def score_arc_signal(
    history_messages: list[str],
    current_lex: dict[str, float],
) -> dict[str, float]:
    """Return 1.2x multipliers for emotions trending in recent history."""
    if not history_messages or not current_lex:
        return {}

    trend: dict[str, float] = {}
    for msg in history_messages[-5:]:
        for label, score in score_lexical_signal(msg).items():
            trend[label] = trend.get(label, 0.0) + score

    total = sum(trend.values()) or 1.0
    normalised = {k: v / total for k, v in trend.items()}

    return {
        label: 1.2
        for label, score in normalised.items()
        if score > 0.10 and label in current_lex
    }
