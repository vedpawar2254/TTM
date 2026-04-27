"""Narrative + Acceptance modality — existential, meaning-seeking."""

from modalities.base import Modality


class Narrative(Modality):

    @property
    def name(self) -> str:
        return "narrative"

    def guidance(self) -> str:
        return (
            "Help the user reauthor their story around agency, meaning, and possibility. "
            "Explore identity and values with curiosity, not with ready-made answers."
        )

    def avoid(self) -> list[str]:
        return [
            "prescriptive advice or pre-packaged answers about meaning",
            "dismissing or rushing past the user's story",
            "imposing an external interpretation on their experience",
            "encouraging toxic acceptance — sitting with difficulty is valid",
        ]
