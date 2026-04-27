"""LLM response safety filter — keyword-based."""

import re
from base import SafetyCheck

_UNSAFE_PATTERNS: list[re.Pattern] = [
    re.compile(r"\b(you should|try) (hang(ing)?|overdos|cut(ting)? yourself)\b", re.I),
    re.compile(r"\b(you (have|are suffering from)|diagnos(e|is))\b", re.I),
    re.compile(r"\btake (these )?pills?\b", re.I),
    re.compile(r"\b(kill yourself|end (it|your life)|hurt yourself)\b", re.I),
]


class PatternSafetyCheck(SafetyCheck):

    @property
    def name(self) -> str:
        return "pattern_safety"

    def check(self, response: str) -> tuple[bool, str]:
        for pattern in _UNSAFE_PATTERNS:
            if pattern.search(response):
                return False, f"matched unsafe pattern: {pattern.pattern}"
        return True, ""
