"""Adaptive Therapy Engine — selects therapeutic modality from emotion signal."""

from modalities.base import Modality
from modalities.cbt import CBT
from modalities.journaling import Journaling
from modalities.mindfulness import Mindfulness
from modalities.narrative import Narrative
from modalities.sfbt import SFBT
from modalities.validation import Validation

# Below this confidence we default to validation (we're unsure of the emotion)
_CONFIDENCE_THRESHOLD = 0.30

_MAP: dict[str, Modality] = {
    "anger":            Validation(),
    "sadness":          Journaling(),
    "anxiety":          Mindfulness(),
    "looping_thoughts": CBT(),
    "goal_oriented":    SFBT(),
    "existential":      Narrative(),
    "neutral":          Validation(),
}

_DEFAULT: Modality = Validation()


def choose_modality(emotion_label: str, confidence: float) -> dict:
    """Return {modality, guidance} for the given emotion + confidence."""
    mod = _DEFAULT if confidence < _CONFIDENCE_THRESHOLD else _MAP.get(emotion_label, _DEFAULT)
    return {"modality": mod.name, "guidance": mod.full_guidance()}
