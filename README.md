# TalktoMe

> A privacy-first AI emotional support companion that adapts to how you actually feel.

TalktoMe is a conversational AI companion for the things people can't say out loud. It detects emotional state in real time and shifts its therapeutic approach mid-conversation — no rigid flows, no one-size-fits-all responses. Privacy isn't a feature; it's the architecture.

---

## The Problem

People carry things they can't say to anyone — not because support isn't available, but because saying it out loud to a human makes it permanent and risky. Judgment from friends, awkwardness with family, the cost of therapy, the shame of admitting you're not okay. These aren't edge cases. They're the main reason most people process their hardest thoughts alone.

Existing tools don't fix this. Therapy apps are expensive and involve human judgment. General AI chatbots have no therapeutic logic and your data is very much not private. Meditation apps calm but don't process. Journaling apps are passive.

The barrier to emotional support isn't access to a calendar booking — it's the fear of being known and judged.

---

## How It Works

Every conversation turn runs through a processing pipeline:

1. **Emotion Detection** — classifies emotional state from lexical signals, semantic embeddings, conversation arc, and explicit user framing
2. **Adaptive Therapy Engine (ATE)** — selects a therapy modality based on detected state, enforces a 2-turn mode-lock before switching to prevent emotional whiplash
3. **LLM Service** — generates a response from a fully assembled, modality-specific system prompt
4. **Response Filter** — safety and quality gate; re-runs crisis detection on every output before it reaches the user

In parallel, a dedicated **Crisis Detection** classifier runs on every message. Soft flags (p > 0.7) surface resources warmly inline. Hard flags (p > 0.9) reroute the entire pipeline to crisis mode.

### Therapy Modalities

| Emotional signal | Modality | Approach |
|-----------------|----------|----------|
| High arousal, anger | Validation + Containment | Hold space, reflect, do not reframe |
| Sadness, grief | Empathic reflection + Journaling | Gentle prompts, no silver linings |
| Cognitive loops | CBT — Thought challenging | Socratic questions, surface distortions |
| Low energy, emptiness | Mindfulness + Grounding | Sensory anchoring, present-focus |
| Goal-oriented | SFBT — Solution-focused | Amplify agency, small steps |
| Existential | Narrative + Acceptance | Reauthoring, ACT-adjacent framing |

---

## Tech Stack

### Frontend
| Layer | Technology |
|-------|------------|
| Web | Next.js |
| Mobile | React Native |

### Backend Services
| Service | Technology |
|---------|------------|
| API Gateway | AWS API Gateway |
| Conversation Service | Node.js |
| Emotion Detection | Python · fine-tuned sentence-transformer |
| Adaptive Therapy Engine | Python · rule + model hybrid |
| LLM Service | Managed API |
| Response Filter | Python |
| Crisis Pipeline | Python · dedicated isolated queue |

### Data
| Store | Technology | Purpose |
|-------|------------|---------|
| Short-term memory | Redis | Encrypted session turns, 7-day TTL |
| Long-term memory | PostgreSQL + pgvector | Theme vectors and session summaries |
| Key management | AWS KMS | Key derivation and storage |

### Infrastructure and Observability
| Concern | Technology |
|---------|------------|
| Containerisation | Docker / Kubernetes |
| Monitoring | Datadog |

---

## Privacy Model

Privacy is enforced structurally, not as a policy.

- **On-device encryption** — messages are encrypted before leaving the client. The server never sees plaintext.
- **Per-user keys** — each user has a master key in KMS. Session keys are derived from it and rotated automatically.
- **No content logs** — the API gateway logs session ID, timestamp, token count, and latency. Nothing else.
- **Short-term memory** — last 20 turns stored encrypted in Redis. Auto-expires in 7 days.
- **Long-term memory** — post-session theme vectors and JSON summaries only. No raw transcripts, no exact quotes, no message-level timestamps.
- **Incognito mode** — zero persistence. Not even a theme vector is saved.
- **Forget me** — master key destruction within 24 hours makes all stored data cryptographically irretrievable.
- **Data export** — DPDP / GDPR-compliant encrypted JSON package delivered to verified email.

---

## Key Features

**Adaptive Therapy Engine** — dynamically selects and switches between CBT, journaling, mindfulness, validation, and SFBT based on detected emotional state, not user settings.

**Memory without surveillance** — long-term themes (not raw transcripts) let TalktoMe feel continuous across sessions. Users don't start from zero every time.

**Crisis-aware, not crisis-obsessed** — a dedicated parallel pipeline for detecting acute distress, tuned for recall over precision. Missing someone in crisis is the unacceptable failure mode.

**Judgment-free design** — the system is explicitly instructed not to moralize, rush to solutions, or project emotions.

**No engagement optimisation** — session length is not a KPI. The system does not tune for return frequency or time-on-app. Outcome metrics only.

---

## Project Structure

```
talktome/
│
├── client/
│   ├── web/                        # Next.js
│   │   ├── app/
│   │   ├── components/
│   │   └── public/
│   └── mobile/                     # React Native
│       ├── android/
│       ├── ios/
│       └── src/
│
├── services/
│   ├── conversation/               # Node.js — turn orchestration
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── context/            # Context window assembly
│   │   │   └── session/            # Redis session management
│   │   └── package.json
│   │
│   ├── emotion/                    # Python — emotion detection
│   │   ├── classifier.py
│   │   ├── signals/
│   │   │   ├── lexical.py
│   │   │   ├── semantic.py
│   │   │   ├── arc.py
│   │   │   └── explicit.py
│   │   └── requirements.txt
│   │
│   ├── ate/                        # Python — Adaptive Therapy Engine
│   │   ├── engine.py
│   │   ├── modalities/             # One file per therapy mode
│   │   │   ├── validation.py
│   │   │   ├── cbt.py
│   │   │   ├── journaling.py
│   │   │   ├── mindfulness.py
│   │   │   ├── sfbt.py
│   │   │   └── narrative.py
│   │   ├── templates/              # Prompt templates per modality
│   │   └── requirements.txt
│   │
│   ├── llm/                        # Python — LLM API wrapper
│   │   ├── client.py
│   │   ├── prompt_builder.py
│   │   └── requirements.txt
│   │
│   ├── filter/                     # Python — response filter
│   │   ├── safety.py
│   │   ├── crisis_recheck.py
│   │   └── requirements.txt
│   │
│   └── crisis/                     # Python — crisis pipeline
│       ├── classifier.py
│       ├── resources.py            # iCall, Vandrevala etc.
│       ├── responses/              # Pre-cached warm responses
│       └── requirements.txt
│
├── data/
│   ├── redis/
│   │   └── config.conf
│   └── postgres/
│       └── migrations/
│           ├── 001_users.sql
│           ├── 002_sessions.sql
│           └── 003_long_term_memory.sql
│
├── infra/
│   ├── docker-compose.yml          # Local dev
│   └── k8s/
│       ├── conversation.yaml
│       ├── emotion.yaml
│       ├── ate.yaml
│       ├── llm.yaml
│       ├── filter.yaml
│       └── crisis.yaml
│
├── docs/
│   └── architecture.md
|
├── README.md
└── .env.example
```

---

## Safety and Ethics

- Crisis resources shown: **iCall** (9152987821) · **Vandrevala Foundation** (1860-2662-345)
- First-session disclosure: TalktoMe is an AI companion, not a therapist
- TalktoMe will never deny being an AI if asked directly
- No medication advice, no diagnosis, no clinical claims
- Prompt injection and jailbreak attempts are silently caught and rerouted
- All flagged safety events are logged by type only — no content

---

## Team

| Name | Role |
|------|------|
| Ved Pawar | Backend Engineering |
| Aarya Srivastava | Product and  |
| Aviral Mishra | System Design |
| Khuswant Rajpurohit | Frontend / UI |
| Samarth Khera | Frontend / UI |

---

*TalktoMe is an AI companion — not a therapist. For mental health emergencies, please contact a crisis line.*
