"""OpenRouter LLM client."""

import os
import urllib.request
import urllib.error
import json

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


def complete(messages: list[dict]) -> str:
    """Send messages to OpenRouter; return assistant reply string."""
    api_key = os.environ["OPENROUTER_API_KEY"]
    model = os.environ.get("LLM_MODEL", "anthropic/claude-3.5-haiku")

    payload = json.dumps({"model": model, "messages": messages}).encode()
    req = urllib.request.Request(
        OPENROUTER_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
            return data["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"OpenRouter {e.code}: {e.read().decode()}") from e
