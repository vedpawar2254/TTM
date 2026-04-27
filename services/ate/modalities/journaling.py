"""Empathic Reflection + Journaling modality — sadness, grief."""

from modalities.base import Modality


class Journaling(Modality):

    @property
    def name(self) -> str:
        return "journaling"

    def guidance(self) -> str:
        return (
            "Sit with the user in their sadness. Offer open-ended, non-judgmental reflection prompts "
            "that invite them to explore and express what they are carrying."
        )

    def avoid(self) -> list[str]:
        return [
            "closed yes/no questions",
            "prescriptive advice or action plans",
            "rushing toward resolution or hope",
            "silver linings or toxic positivity",
        ]
