"""Mindfulness + Grounding modality — low energy, emptiness, anxiety."""

from modalities.base import Modality


class Mindfulness(Modality):

    @property
    def name(self) -> str:
        return "mindfulness"

    def guidance(self) -> str:
        return (
            "Gently guide the user's attention back to the present moment. "
            "Offer simple sensory grounding prompts — breath, body, surroundings."
        )

    def avoid(self) -> list[str]:
        return [
            "analysing the past or projecting into the future",
            "complex multi-step instructions",
            "minimising how the user feels",
            "spiritual or religious language unless the user introduces it",
        ]
