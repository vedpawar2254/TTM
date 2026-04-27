"""Safety check base and composite — Composite pattern."""

from abc import ABC, abstractmethod


class SafetyCheck(ABC):

    @property
    @abstractmethod
    def name(self) -> str: ...

    @abstractmethod
    def check(self, response: str) -> tuple[bool, str]: ...


class CompositeSafetyCheck(SafetyCheck):

    @property
    def name(self) -> str:
        return "composite"

    def __init__(self, checks: list[SafetyCheck]) -> None:
        self._checks = checks

    def check(self, response: str) -> tuple[bool, str]:
        for c in self._checks:
            passes, reason = c.check(response)
            if not passes:
                return False, f"[{c.name}] {reason}"
        return True, ""
