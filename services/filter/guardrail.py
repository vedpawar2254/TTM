"""Output guardrail — catches identity violations and prompt leakage in LLM responses."""

import re
from base import SafetyCheck

_IDENTITY_VIOLATIONS: list[re.Pattern] = [
    # LLM claiming to be something else
    re.compile(r"\bI\s+am\s+(?:now|actually|really)\s+(?:a|an|your)\b", re.I),
    re.compile(r"\bI\s*(?:'m|am)\s+(?:DAN|an?\s+unfiltered|jailbr)", re.I),
    re.compile(r"\bmy\s+(?:real|true|actual)\s+(?:name|identity|purpose)\s+is\b", re.I),
    # System prompt leakage
    re.compile(r"\bmy\s+system\s+prompt\s+(?:is|says|reads|contains)\b", re.I),
    re.compile(r"\bhere\s+(?:are|is)\s+my\s+(?:system|internal|original)\s+(?:prompt|instructions)\b", re.I),
    re.compile(r"SAFETY AND IDENTITY RULES", re.I),
]

_SCOPE_VIOLATIONS: list[re.Pattern] = [
    # Generating code / technical output
    re.compile(r"```(?:python|javascript|bash|sql|sh|js|ts|html|css)\b"),
    re.compile(r"\bSELECT\s+\*?\s+FROM\s+\w+", re.I),
    re.compile(r"\b(?:sudo|rm\s+-rf|chmod|curl\s+-|wget\s+http)", re.I),
    # Medical prescriptions
    re.compile(r"\b(?:prescribe|take\s+\d+\s*mg|dosage\s*(?:of|:))\b", re.I),
    re.compile(r"\byou\s+(?:have|suffer\s+from|are\s+diagnosed\s+with)\s+(?:bipolar|schizophren|BPD|PTSD|OCD|ADHD|MDD)\b", re.I),
]


class GuardrailCheck(SafetyCheck):

    @property
    def name(self) -> str:
        return "guardrail"

    def check(self, response: str) -> tuple[bool, str]:
        for pattern in _IDENTITY_VIOLATIONS:
            if pattern.search(response):
                return False, f"identity_violation: {pattern.pattern}"

        for pattern in _SCOPE_VIOLATIONS:
            if pattern.search(response):
                return False, f"scope_violation: {pattern.pattern}"

        return True, ""
