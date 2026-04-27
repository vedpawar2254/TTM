"""Semantic emotion signal via LLM zero-shot classification (OpenRouter)."""

import json
import os
import httpx

_OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
_LABELS = (
    "anger", "sadness", "anxiety", "looping_thoughts",
    "goal_oriented", "existential", "neutral",
)
_PROMPT = """\
Classify the primary emotion in this mental health support chat message.
Message: "{message}"
Choose ONE label from: {labels}
Respond ONLY with valid JSON, no prose: {{"label": "<label>", "confidence": <float 0-1>}}"""


async def score_semantic_signal(message: str) -> dict[str, float]:
    """Return {{label: confidence}} via LLM zero-shot classification."""
    prompt = _PROMPT.format(
        message=message.replace('"', "'"),
        labels=", ".join(_LABELS),
    )
    payload = {
        "model": os.environ.get("LLM_MODEL", "anthropic/claude-3.5-haiku"),
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 60,
    }
    headers = {
        "Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(_OPENROUTER_URL, json=payload, headers=headers)
        resp.raise_for_status()

    raw = resp.json()["choices"][0]["message"]["content"].strip()
    parsed = json.loads(raw)
    label = parsed.get("label", "neutral")
    confidence = float(parsed.get("confidence", 0.5))
    return {label: confidence} if label in _LABELS else {}
