# TalktoMe — System Architecture

## Overview

TalktoMe follows a six-tier layered architecture built around three constraints: privacy by structure, sub-800ms P95 latency to first token, and a 4-nines SLA on the crisis detection path. The system is stateless at the service layer — all session state lives in Redis — so any pod can serve any request and horizontal scaling is straightforward.

---

## Architecture Diagram

```
Client (Web / Mobile)
          |
          v
      API Gateway
 (Auth · Rate limiting · Routing · Metadata-only logging)
          |
          v
  Conversation Service
  (Stateless · Context window assembly)
          |
          v
  ┌────────────────────────────────────────────────────┐
  │                 Processing Layer                    │
  │                                                     │
  │  Emotion      Therapy       LLM         Response   │
  │  Detection ──► Engine ────► Service ──► Filter     │
  └────────────────────────────────────────────────────┘
          |                         |
          |                         | async memory update
          v                         v
  ┌────────────────────────────────────────────────────┐
  │             Data and Infrastructure                 │
  │                                                     │
  │  Redis        Postgres      Key           Crisis   │
  │               + qdrant    Management    Pipeline  │
  └────────────────────────────────────────────────────┘
          |
          v
  Monitoring and Observability
```

---

## Tier 1 — Client

The web and mobile clients handle user interaction and send requests to the API gateway.

---

## Tier 2 — API Gateway

Single entry point for all traffic. Authenticates, rate-limits, routes, and logs — metadata only. No request body content is ever written to a log.


| Concern          | Detail                                                           |
| ---------------- | ---------------------------------------------------------------- |
| Authentication   | JWT per request                                                  |
| Rate limiting    | 100 turns/session · 10 sessions/day                              |
| Burst protection | Per-IP throttle on unauthenticated session creation              |
| Logging          | Session ID (anonymised) · timestamp · token count · latency only |


---

## Tier 3 — Conversation Service

Orchestrates every conversation turn. Stateless — any instance can serve any request.

On each turn it: decrypts the incoming message, fetches the last 20 turns from Redis, assembles the context window, and dispatches to the processing layer. After the response is returned to the user, it triggers an async memory update.

**Context window budget:** ~400 tokens for the system prompt, ~2000 for turn history, ~1600 reserved for generation. When the 20-turn limit is hit, oldest turns are compressed into a rolling summary — users never feel a reset.

---

## Tier 4 — Processing Layer

Four services run on every turn. Emotion Detection and Crisis Detection run in parallel at the start; the remaining three are sequential.

### Emotion Detection Service

Classifies the emotional state of the incoming message from four independent signals:


| Signal              | Method                                                             |
| ------------------- | ------------------------------------------------------------------ |
| Lexical             | Intensity markers, affect words, urgency language                  |
| Semantic embeddings | Similarity to therapy-tagged high/low arousal clusters             |
| Conversation arc    | Tone shift across last N turns — prevents one-turn overreaction    |
| Explicit framing    | User statements like "I just need to vent" override the classifier |


Output: an `EmotionState` vector (arousal level, valence, topic category, confidence score).

### Adaptive Therapy Engine (ATE)

Maps the `EmotionState` to a therapy modality and builds the full system prompt for the LLM. The mode-lock rule — 2+ sustained turns of a new signal before switching modality — is the core clinical logic that prevents emotional whiplash.


| Detected signal              | Modality                         | Behaviour                               |
| ---------------------------- | -------------------------------- | --------------------------------------- |
| High arousal, anger          | Validation + Containment         | Hold space, reflect, do not reframe     |
| Sadness, grief               | Empathic reflection + Journaling | Gentle prompts, no silver linings       |
| Cognitive loops              | CBT — Thought challenging        | Socratic questions, surface distortions |
| Low energy, emptiness        | Mindfulness + Grounding          | Sensory anchoring, present-focus        |
| Goal-oriented                | SFBT — Solution-focused          | Amplify agency, small steps             |
| Existential, meaning-seeking | Narrative + Acceptance           | Reauthoring, ACT-adjacent framing       |


System prompt assembled per turn:

```
[1] Identity layer       — warm, non-judgmental AI; not a therapist
[2] Therapy mode         — injected by ATE based on current emotional state
[3] Safety constraints   — always present, never overridden
[4] Long-term memory     — compressed theme summary, not raw transcripts
[5] Conversation history — last 20 turns
[6] Current message
```

### LLM Service

Receives the assembled prompt and returns a streamed completion via a managed API.

Latency target: first token streamed within 800ms P95.

### Response Filter

Runs on every LLM completion before it reaches the user. Two checks:

1. **Safety gate** — scans for clinical claims, diagnosis language, or hallucinated medical advice. Blocked responses are replaced with a clarifying prompt.
2. **Crisis re-detection** — the crisis classifier runs again on the output. If flagged, the response is rerouted to the Crisis Pipeline instead of being returned.

This two-pass approach (input + output) ensures crisis signals in LLM-generated content are caught before they reach a vulnerable user.

---

## Tier 5 — Data and Infrastructure

### Redis — Short-Term Memory


| Property       | Detail                                                                |
| -------------- | --------------------------------------------------------------------- |
| What is stored | Conversation turns (last 20) · session metadata · ATE state vector    |
| TTL            | 7 days from last activity · immediate deletion for incognito sessions |
| Latency target | < 5ms P99 read/write                                                  |


### PostgreSQL + qdrant — Long-Term Memory


| Property           | Detail                                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| What is stored     | Session theme summary (encrypted JSON) · semantic embedding vector                                              |
| What is NOT stored | Raw messages · exact quotes · message-level timestamps                                                          |
| Default retention  | 90 days, user-configurable from 0 to indefinite                                                                 |
| Schema             | `user_id` (hashed) · `session_date` · `theme_vector` (float[]) · `summary_json` (encrypted) · `modalities_used` |


The vector encodes emotional territory, not message content. Semantically meaningful for continuity but not re-identifiable on its own.

### Key Management Service

AWS KMS handles key storage and derivation. On forget-me, key destruction makes all stored data cryptographically irretrievable within 24 hours.

### Crisis Pipeline — Isolated Service

Separated from the main service mesh with its own dedicated queue, pods, and scaling policy. Cannot be starved by regular traffic spikes.


| Property            | Detail                                                            |
| ------------------- | ----------------------------------------------------------------- |
| SLA                 | 99.99% (4-nines)                                                  |
| Soft flag (p > 0.7) | Crisis resources shown inline, warmly phrased                     |
| Hard flag (p > 0.9) | Full pipeline reroute to crisis mode                              |
| Fallback            | Pre-cached warm responses served if pipeline is unavailable       |
| Classifier tuning   | Recall-biased — false negatives are the catastrophic failure mode |
| Resources shown     | iCall (9152987821) · Vandrevala Foundation (1860-2662-345)        |
| Logging             | Session ID + encrypted timestamp only · no message content        |


---

## Tier 6 — Monitoring and Observability

Zero content logging enforced at the infrastructure level. Only operational metadata is tracked.


| Category     | Metrics                                                                           |
| ------------ | --------------------------------------------------------------------------------- |
| Latency      | Time to first token (< 800ms P95) · full response (< 3s P95) · crisis path (< 3s) |
| Availability | Conversation service 99.9% · crisis pipeline 99.99%                               |
| Safety       | Crisis classifier F1 > 0.88 · false negative rate < 2% · privacy incidents = 0    |
| Quality      | ATE modality accuracy > 80% · session completion rate > 70%                       |


What is deliberately not tracked: session length, crisis resource tap-through rate, raw DAU as primary signal.

---

## Privacy Architecture


| Mechanism              | Implementation                                                            |
| ---------------------- | ------------------------------------------------------------------------- |
| Encryption             | Managed via AWS KMS                                                       |
| No-log guarantee       | No raw content in any persistent log · no IP addresses linked to identity |
| Incognito mode         | Zero persistence — no theme vector, no session data saved                 |
| Cryptographic deletion | Key destruction on forget-me — all data irretrievable within 24 hours     |
| Data export            | DPDP / GDPR-compliant encrypted JSON to verified email                    |


---

## Scalability Plan


| Milestone      | Key change                              |
| -------------- | --------------------------------------- |
| 0–10K users    | Managed LLM API + single Redis instance |
| 10K–100K users | Redis Cluster + horizontal autoscaling  |
| 100K–1M+ users | Multi-region routing + CDN              |


---

*TalktoMe Architecture · Internal and Confidential · April 2025*