# TalktoMe

> A privacy-first AI emotional support companion that adapts to how you actually feel.

TalktoMe is a conversational AI companion for the things people can't say out loud. It detects emotional state in real time and shifts its therapeutic approach mid-conversation — no rigid flows, no one-size-fits-all responses. Privacy isn't a feature; it's the architecture.

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ with venv
- macOS / Linux (Windows support in progress)

### Setup & Running

#### 1. Install Python Dependencies
```bash
# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On macOS/Linux
# .venv\Scripts\activate   # On Windows

# Install backend dependencies
pip install fastapi uvicorn pydantic httpx
```

#### 2. Install Frontend Dependencies
```bash
cd TTM/client/web
npm install
```

#### 3. Start All Services
```bash
# Terminal 1: Web Frontend (Next.js)
cd TTM/client/web
npm run dev
# Accessible at http://localhost:3000

# Terminal 2: ATE Service
.venv/bin/python -m uvicorn app:app --app-dir TTM/services/ate --port 8001 --host 127.0.0.1

# Terminal 3: Crisis Service
.venv/bin/python -m uvicorn app:app --app-dir TTM/services/crisis --port 8002 --host 127.0.0.1

# Terminal 4: Emotion Service
.venv/bin/python -m uvicorn app:app --app-dir TTM/services/emotion --port 8003 --host 127.0.0.1

# Terminal 5: Filter Service
.venv/bin/python -m uvicorn app:app --app-dir TTM/services/filter --port 8004 --host 127.0.0.1
```

#### Verify Services
```bash
curl http://127.0.0.1:8001/health
curl http://127.0.0.1:8002/health
curl http://127.0.0.1:8003/health
curl http://127.0.0.1:8004/health
```

---

## The Problem

People carry things they can't say to anyone — not because support isn't available, but because saying it out loud to a human makes it permanent and risky. Judgment from friends, awkwardness with family, the cost of therapy, the shame of admitting you're not okay. These aren't edge cases. They're the main reason most people process their hardest thoughts alone.

Existing tools don't fix this. Therapy apps are expensive and involve human judgment. General AI chatbots have no therapeutic logic and your data is very much not private. Meditation apps calm but don't process. Journaling apps are passive.

The barrier to emotional support isn't access to a calendar booking — it's the fear of being known and judged.

---

## How It Works

Every conversation turn runs through a sequential processing pipeline, with crisis detection running in parallel throughout:

```
User message
    │
    ├─► Crisis Detection (parallel, every turn)
    │       soft flag (medium risk) → surface resources inline
    │       hard flag (high risk)   → reroute entire pipeline to crisis mode
    │
    └─► Emotion Detection
            │
            ▼
        Adaptive Therapy Engine  →  select modality + build system prompt
            │
            ▼
        LLM API  (OpenRouter / any OpenAI-compatible provider)
            │
            ▼
        Response Filter  →  safety gate + crisis re-check on output
            │
            ▼
        User sees response
```

### Emotion Detection — Four Signals

| Signal | Method |
|--------|--------|
| Lexical | Intensity markers, affect words, urgency language |
| Semantic | Similarity to therapy-tagged high/low arousal clusters |
| Conversation arc | Tone shift across last N turns — prevents one-turn overreaction |
| Explicit framing | User statements like "I just need to vent" override the classifier |

### Adaptive Therapy Engine (ATE)

Maps the detected emotion to a therapy modality. A **2-turn mode-lock** prevents emotional whiplash — the modality only switches after the new signal is sustained for 2+ turns.

| Detected emotion | Modality | Behaviour |
|-----------------|----------|-----------|
| Anger, high arousal | Validation + Containment | Hold space, reflect, do not reframe |
| Sadness, grief | Empathic Reflection + Journaling | Gentle prompts, no silver linings |
| Looping thoughts | CBT — Thought Challenging | Socratic questions, surface distortions |
| Low energy, emptiness | Mindfulness + Grounding | Sensory anchoring, present-focus |
| Goal-oriented | SFBT — Solution-Focused | Amplify agency, small steps |
| Existential, meaning-seeking | Narrative + Acceptance | Reauthoring, ACT-adjacent framing |

---

## Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Web | Next.js 16 · React 19 · TypeScript |
| Mobile | React Native *(in development)* |

### Backend Services
| Service | Technology | Port |
|---------|-----------|------|
| Conversation | Node.js 22 · Express | 3001 (Docker) / 4000 (local dev) |
| Emotion Detection | Python 3 · FastAPI · uvicorn | 8001 |
| Adaptive Therapy Engine | Python 3 · FastAPI · uvicorn | 8002 |
| Crisis Detection | Python 3 · FastAPI · uvicorn | 8003 |
| Response Filter | Python 3 · FastAPI · uvicorn | 8004 |
| LLM | OpenRouter (OpenAI-compatible API) | — |

### Data
| Store | Technology | Purpose |
|-------|-----------|---------|
| Session history | PostgreSQL 16 | Message turns per session |
| Short-term memory | Redis 7 | Session state, ATE mode vector |
| Long-term memory | PostgreSQL + pgvector *(planned)* | Theme vectors, session summaries |

### Infrastructure
| Concern | Technology |
|---------|-----------|
| Containerisation | Docker · Docker Compose |
| Reverse proxy | nginx *(production)* |

---

## Project Structure

```
TalktoMe/
│
├── client/
│   ├── web/                          # Next.js 16 web app
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── auth/route.ts         # POST /api/auth  →  /auth/anon
│   │   │   │   ├── sessions/route.ts     # POST /api/sessions  →  /sessions
│   │   │   │   ├── chat/route.ts         # POST /api/chat  →  conversation service
│   │   │   │   └── history/
│   │   │   │       └── [session_id]/
│   │   │   │           └── route.ts      # GET /api/history/:id  →  conversation service
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ChatShell.tsx         # Two-panel chat UI with sidebar
│   │   │   └── ChatShell.module.css
│   │   ├── .env.local                # CONVERSATION_SERVICE_URL (gitignored)
│   │   └── .env.local.example
│   │
│   └── mobile/                       # React Native (in development)
│
├── services/
│   ├── conversation/                 # Node.js — turn orchestration
│   │   ├── src/
│   │   │   ├── middleware/auth.js     # JWT validation middleware
│   │   │   ├── routes/
│   │   │   │   ├── auth.js           # POST /auth/anon — anonymous account creation
│   │   │   │   ├── sessions.js       # POST /sessions — create session for authed user
│   │   │   │   └── chat.js           # POST /chat · GET /chat/history/:id
│   │   │   ├── services/             # emotionClient, ateClient, crisisClient, filterClient, llmClient
│   │   │   ├── db/                   # pool.js · messages.js
│   │   │   ├── context/              # Context window assembly
│   │   │   └── session/              # Redis session management
│   │   ├── .env                      # Runtime env (gitignored)
│   │   └── .env.example
│   │
│   ├── emotion/                      # Python — emotion detection
│   │   ├── app.py                    # FastAPI app · POST /classify
│   │   ├── classifier.py             # Signal aggregator
│   │   └── signals/
│   │       ├── lexical.py
│   │       ├── semantic.py
│   │       ├── arc.py
│   │       └── explicit.py
│   │
│   ├── ate/                          # Python — Adaptive Therapy Engine
│   │   ├── app.py                    # FastAPI app · POST /modality
│   │   ├── engine.py                 # Emotion → modality mapping + mode-lock
│   │   └── modalities/               # cbt.py · journaling.py · mindfulness.py · narrative.py · sfbt.py · validation.py
│   │
│   ├── crisis/                       # Python — crisis detection
│   │   ├── app.py                    # FastAPI app · POST /classify
│   │   ├── classifier.py             # Keyword classifier (high / medium / low risk)
│   │   └── resources.py              # iCall, Vandrevala Foundation numbers
│   │
│   ├── filter/                       # Python — response safety gate
│   │   ├── app.py                    # FastAPI app · POST /check
│   │   ├── safety.py                 # Clinical claim / hallucination detection
│   │   └── crisis_recheck.py         # Second-pass crisis scan on LLM output
│   │
│   └── llm/                          # Python — LLM client (used by conversation service via Node)
│       ├── client.py
│       └── prompt_builder.py
│
├── data/
│   ├── postgres/
│   │   └── migrations/
│   │       ├── 001_users.sql
│   │       ├── 002_sessions.sql
│   │       ├── 003_long_term_memory.sql
│   │       ├── 004_messages.sql
│   │       └── 005_auth.sql          # email nullable, messages→sessions FK
│   └── redis/
│       └── config.conf
│
├── infra/
│   ├── docker-compose.yml            # Local dev — postgres + redis + all services
│   └── nginx.conf                    # Reverse proxy config
│
├── docs/
│   ├── ARCH.md
│   ├── Flow.md
│   ├── UML.md
│   ├── ER_diagram.md
│   └── planning/
│       ├── epics.md
│       └── stories.md
│
├── .env.example
└── README.md
```

---

## Local Development

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker Desktop (for postgres)
- Redis (running locally, or use Docker)

### 1. Clone and set up environment

```bash
git clone <repo-url>
cd TalktoMe
```

### 2. Start infrastructure (postgres via Docker)

```bash
cd infra
docker compose up -d postgres
```

> **Note:** If you have a local postgres already running on port 5432, the compose file maps Docker postgres to `5433`. Update `DATABASE_URL` accordingly.

Redis is expected at `localhost:6379`. Start it separately if not already running:
```bash
redis-server
```

### 3. Conversation service

```bash
cd services/conversation

# Copy env and fill in your values
cp .env.example .env
# Edit .env — set OPENROUTER_API_KEY and JWT_SECRET at minimum

npm install
npm run dev        # starts on PORT (default 3000, set in .env)
```

**`services/conversation/.env`:**
```env
PORT=4000
DATABASE_URL=postgres://talktome:talktome@localhost:5433/talktome
JWT_SECRET=<run: openssl rand -hex 32>
OPENROUTER_API_KEY=sk-or-...
LLM_MODEL=anthropic/claude-3.5-haiku
EMOTION_SERVICE_URL=http://localhost:8001
ATE_SERVICE_URL=http://localhost:8002
CRISIS_SERVICE_URL=http://localhost:8003
FILTER_SERVICE_URL=http://localhost:8004
```

### 4. Python microservices

Install deps (shared packages, run once):
```bash
pip install fastapi "uvicorn[standard]" httpx
```

Start each service in a separate terminal:

```bash
# Emotion detection — port 8001
cd services/emotion
OPENROUTER_API_KEY=sk-or-... python3 -m uvicorn app:app --port 8001

# Adaptive Therapy Engine — port 8002
cd services/ate
python3 -m uvicorn app:app --port 8002

# Crisis detection — port 8003
cd services/crisis
python3 -m uvicorn app:app --port 8003

# Response filter — port 8004
cd services/filter
python3 -m uvicorn app:app --port 8004
```

### 5. Web frontend

```bash
cd client/web

cp .env.local.example .env.local
# Edit .env.local — set CONVERSATION_SERVICE_URL

npm install
npm run dev        # starts on http://localhost:3000 (or 3001 if 3000 is taken)
```

**`client/web/.env.local`:**
```env
CONVERSATION_SERVICE_URL=http://localhost:4000
```

### Health checks

```bash
curl http://localhost:8001/health   # emotion
curl http://localhost:8002/health   # ate
curl http://localhost:8003/health   # crisis
curl http://localhost:8004/health   # filter
curl http://localhost:4000/health   # conversation
```

---

## API Reference

### Conversation Service (`localhost:4000`)

All endpoints except `/auth/anon` require `Authorization: Bearer <token>`.

#### `POST /auth/anon`

Creates an anonymous account (no PII) and returns a signed JWT. Call this once on first launch and store the token.

**Response:**
```json
{ "token": "<jwt>" }
```

---

#### `POST /sessions`

Creates a new conversation session linked to the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{ "session_id": "uuid-v4" }
```

---

#### `POST /chat`

Send a message and receive a reply.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "session_id": "uuid-v4",
  "message": "I've been really anxious lately"
}
```

**Response:**
```json
{
  "session_id": "uuid-v4",
  "reply": "That sounds really exhausting...",
  "crisis": false
}
```

`crisis: true` is returned when a high-risk flag triggered the crisis pipeline. Returns `403` if the session does not belong to the authenticated user.

---

#### `GET /chat/history/:session_id`

Fetch the message history for a session.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "session_id": "uuid-v4",
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

Returns `403` if the session does not belong to the authenticated user.

---

### Python Services (internal)

| Service | Endpoint | Input | Output |
|---------|----------|-------|--------|
| Emotion | `POST /classify` | `{ message, history_messages[] }` | `{ label, confidence }` |
| ATE | `POST /modality` | `{ emotion_label, confidence }` | `{ modality, guidance }` |
| Crisis | `POST /classify` | `{ message }` | `{ risk, probability, resources }` |
| Filter | `POST /check` | `{ response }` | `{ passes, safety_reason, crisis_probability }` |

---

## Environment Variables

### `services/conversation/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Port to listen on (default: 3000) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret used to sign anonymous JWTs — generate with `openssl rand -hex 32` |
| `OPENROUTER_API_KEY` | Yes | API key for OpenRouter (or any OpenAI-compatible LLM provider) |
| `LLM_MODEL` | No | Model ID to use (default: `anthropic/claude-3.5-haiku`) |
| `EMOTION_SERVICE_URL` | Yes | Base URL of the emotion service |
| `ATE_SERVICE_URL` | Yes | Base URL of the ATE service |
| `CRISIS_SERVICE_URL` | Yes | Base URL of the crisis service |
| `FILTER_SERVICE_URL` | Yes | Base URL of the filter service |

### `client/web/.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `CONVERSATION_SERVICE_URL` | Yes | Base URL of the conversation service (server-side only, never exposed to browser) |

---

## Privacy Model

Privacy is enforced structurally, not as a policy.

- **Anonymous by default** — no email, no name, no phone number. A user is an opaque UUID. The browser receives a signed JWT; the server stores nothing linkable to a real identity.
- **No content logs** — the conversation service logs error type only. No message content is ever written to a log.
- **Session ownership enforced** — every read/write validates that the session belongs to the authenticated user. Session IDs alone are not enough to access data.
- **Short-term memory** — last 20 turns per session in Redis, auto-expiring after 7 days of inactivity.
- **Long-term memory** *(planned)* — post-session theme vectors and JSON summaries only. No raw transcripts, no exact quotes, no message-level timestamps.
- **Incognito mode** *(planned)* — zero persistence. Not even a theme vector is saved.
- **Forget me** *(planned)* — key destruction makes all stored data cryptographically irretrievable within 24 hours.

---

## Safety and Ethics

- Crisis resources surfaced: **iCall** (9152987821) · **Vandrevala Foundation** (1860-2662-345)
- First-session disclosure: TalktoMe is an AI companion, not a therapist
- TalktoMe will never deny being an AI if asked directly
- No medication advice, no diagnosis, no clinical claims
- Response filter blocks hallucinated clinical content before it reaches the user
- All flagged safety events are logged by type only — no content

---

## Database Schema

Migrations run automatically when the postgres Docker container starts (`docker-entrypoint-initdb.d`).

| Table | Purpose |
|-------|---------|
| `users` | User accounts (anonymous by default) |
| `sessions` | Session metadata |
| `messages` | Per-turn message history (`session_id`, `role`, `content`, `created_at`) |
| `long_term_memory` | Post-session theme vectors and summaries *(planned)* |

---

## Team

| Name | Role |
|------|------|
| Ved Pawar | Backend Engineering |
| Aarya Srivastava | Product |
| Aviral Mishra | System Design |
| Khuswant Rajpurohit | Frontend / UI |
| Samarth Khera | Frontend / UI |

---

*TalktoMe is an AI companion — not a therapist. For mental health emergencies, please contact a crisis line.*
