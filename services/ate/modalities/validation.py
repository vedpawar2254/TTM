"""Validation + Containment modality — high arousal, anger."""

from modalities.base import Modality


class Validation(Modality):

    @property
    def name(self) -> str:
        return "validation"

    def guidance(self) -> str:
        return "Hold space. Reflect the emotion back clearly and validate it without judgment."

    def avoid(self) -> list[str]:
        return [
            "reframing or looking for silver linings",
            "suggesting solutions or next steps",
            "minimising or explaining away the feeling",
            "asking why they feel that way",
        ]
