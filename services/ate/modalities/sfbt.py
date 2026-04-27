"""Solution-Focused Brief Therapy modality — goal-oriented, agency."""

from modalities.base import Modality


class SFBT(Modality):

    @property
    def name(self) -> str:
        return "sfbt"

    def guidance(self) -> str:
        return (
            "Amplify the user's existing strengths and agency. "
            "Help them identify one small, concrete next step toward what they want."
        )

    def avoid(self) -> list[str]:
        return [
            "dwelling on problems or past failures",
            "negative or deficit framing",
            "open-ended emotional processing — stay action-oriented",
            "overwhelming the user with multiple steps at once",
        ]
