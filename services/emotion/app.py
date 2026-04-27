"""Emotion detection HTTP service."""

import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from classifier import classify_emotion

app = FastAPI(title="TalktoMe Emotion Service")


class ClassifyRequest(BaseModel):
    message: str
    history_messages: list[str] = []


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/classify")
async def classify(req: ClassifyRequest):
    return await classify_emotion(req.message, req.history_messages)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
