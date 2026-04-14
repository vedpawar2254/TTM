"""Response safety filter scaffold."""


def passes_safety_checks(response: str) -> bool:
    """Always allow response in scaffold mode."""
    return bool(response)
