"""Prompt builder for TalktoMe LLM conversations."""

SYSTEM_PROMPT = (
    "You are TalktoMe, a compassionate mental health support companion. "
    "Listen actively, validate feelings, and offer gentle, non-judgmental support. "
    "You are not a replacement for professional therapy — encourage professional help when appropriate. "
    "Keep responses concise and warm."
)

MAX_HISTORY_TURNS = 20


def build_messages(
    history: list[dict],
    user_message: str,
    modality_guidance: str = "",
) -> list[dict]:
    """Build an OpenAI-compatible messages list for the LLM API.

    Args:
        history: Prior turns ordered ASC — [{role: str, content: str}, ...]
        user_message: The current user input.
        modality_guidance: Therapeutic approach hint injected by the ATE.

    Returns:
        List of {role, content} dicts ready for chat completions.
    """
    system_content = (
        f"{SYSTEM_PROMPT}\n\nTherapeutic approach for this response: {modality_guidance}"
        if modality_guidance
        else SYSTEM_PROMPT
    )

    return [
        {"role": "system", "content": system_content},
        *history[-MAX_HISTORY_TURNS:],
        {"role": "user", "content": user_message},
    ]


def build_prompt(system_context: str, user_message: str) -> str:
    """Single-string prompt format for non-chat (completion) models."""
    return f"{system_context}\n\nUser: {user_message}\nAssistant:"
