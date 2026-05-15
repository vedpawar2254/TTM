"""Response safety filter HTTP service."""

import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from base import CompositeSafetyCheck
from safety import PatternSafetyCheck
from crisis_recheck import CrisisRecheckCheck
from guardrail import GuardrailCheck

app = FastAPI(title="TalktoMe Filter Service")

_checker = CompositeSafetyCheck([PatternSafetyCheck(), CrisisRecheckCheck(), GuardrailCheck()])


class FilterRequest(BaseModel):
    response: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/check")
def check(req: FilterRequest):
    passes, reason = _checker.check(req.response)
    crisis_prob = CrisisRecheckCheck.probability(req.response)
    return {
        "passes": passes,
        "safety_reason": reason,
        "crisis_probability": crisis_prob,
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
