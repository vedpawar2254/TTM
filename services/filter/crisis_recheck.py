"""Second-pass crisis scan on the assistant's own response."""

from base import SafetyCheck

_CRISIS_MARKERS: list[str] = [
    "kill yourself", "end your life", "hurt yourself",
    "no point going on", "you should give up",
]

_THRESHOLD = 0.5


class CrisisRecheckCheck(SafetyCheck):

    @property
    def name(self) -> str:
        return "crisis_recheck"

    def check(self, response: str) -> tuple[bool, str]:
        prob = self.probability(response)
        if prob >= _THRESHOLD:
            return False, f"crisis_probability={prob:.2f}"
        return True, ""

    @staticmethod
    def probability(response: str) -> float:
        """Return probability [0, 1] that the response contains crisis content."""
        text = response.lower()
        hits = sum(1 for marker in _CRISIS_MARKERS if marker in text)
        return min(1.0, hits * 0.5)
