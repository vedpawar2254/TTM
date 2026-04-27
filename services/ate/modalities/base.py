"""Base class for all therapeutic modalities."""

from abc import ABC, abstractmethod


class Modality(ABC):

    @property
    @abstractmethod
    def name(self) -> str: ...

    @abstractmethod
    def guidance(self) -> str: ...

    def avoid(self) -> list[str]:
        """Phrases / tendencies the LLM must avoid in this modality.
        Override in subclasses to inject mode-specific constraints."""
        return []

    def full_guidance(self) -> str:
        """Complete guidance string injected into the system prompt.
        Combines guidance() with avoid() into a single instruction."""
        text = self.guidance()
        if avoids := self.avoid():
            text += " Avoid: " + "; ".join(avoids) + "."
        return text
