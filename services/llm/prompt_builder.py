"""Prompt builder scaffold."""


def build_prompt(system_context: str, user_message: str) -> str:
    """Assemble a simple placeholder prompt."""
    return f"{system_context}\n\nUser: {user_message}"
