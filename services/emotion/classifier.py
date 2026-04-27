"""Emotion classifier — fuses lexical, explicit, semantic, and arc signals."""

from signals.lexical import score_lexical_signal
from signals.explicit import score_explicit_signal
from signals.semantic import score_semantic_signal
from signals.arc import score_arc_signal


async def classify_emotion(message: str, history_messages: list[str]) -> dict:
    """Return {label, confidence, scores}.

    Weights: explicit self-report (0.40) > semantic LLM (0.35) > lexical (0.25).
    Falls back to lexical+explicit if semantic call fails.
    """
    lex = score_lexical_signal(message)
    exp = score_explicit_signal(message)
    arc_mult = score_arc_signal(history_messages, lex)

    try:
        sem = await score_semantic_signal(message)
        w_exp, w_sem, w_lex = 0.40, 0.35, 0.25
    except Exception:
        sem = {}
        w_exp, w_sem, w_lex = 0.55, 0.00, 0.45

    all_labels = set(lex) | set(exp) | set(sem)
    combined = {
        label: (
            w_exp * exp.get(label, 0.0)
            + w_sem * sem.get(label, 0.0)
            + w_lex * lex.get(label, 0.0)
        )
        for label in all_labels
    }

    for label, mult in arc_mult.items():
        if label in combined:
            combined[label] = min(1.0, combined[label] * mult)

    if not combined or max(combined.values()) == 0:
        return {"label": "neutral", "confidence": 0.0, "scores": {}}

    best = max(combined, key=combined.get)
    return {
        "label": best,
        "confidence": round(combined[best], 3),
        "scores": {k: round(v, 3) for k, v in combined.items()},
    }
