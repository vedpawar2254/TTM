"""Crisis detection HTTP service."""

import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from classifier import classify_crisis_risk

app = FastAPI(title="TalktoMe Crisis Service")


class CrisisRequest(BaseModel):
    message: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/classify")
def classify(req: CrisisRequest):
    return classify_crisis_risk(req.message)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
