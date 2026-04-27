"""Adaptive Therapy Engine HTTP service."""

import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from engine import choose_modality

app = FastAPI(title="TalktoMe ATE Service")


class ModalityRequest(BaseModel):
    emotion_label: str
    confidence: float


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/modality")
def get_modality(req: ModalityRequest):
    return choose_modality(req.emotion_label, req.confidence)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
