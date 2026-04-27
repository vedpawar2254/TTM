"""Cognitive Behavioural Therapy modality — looping thoughts, rumination."""

from modalities.base import Modality


class CBT(Modality):

    @property
    def name(self) -> str:
        return "cbt"

    def guidance(self) -> str:
        return (
            "Use gentle Socratic questions to surface and examine cognitive distortions. "
            "Invite the user to inspect the evidence for their thoughts rather than telling them what to think."
        )

    def avoid(self) -> list[str]:
        return [
            "telling the user what to think or feel",
            "moralising or lecturing",
            "rushing to a positive reframe before the distortion is examined",
            "dismissing the thought as irrational",
        ]
