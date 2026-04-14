# TalktoMe Stories

## Epic 1: Product Foundations and Access
1. As a first-time user, I can see a clear AI disclosure before chatting so that I understand this is not a human therapist.
2. As a user, I can create a session and receive a session ID so that my conversation state can be managed safely.
3. As a user, I can toggle incognito mode so that no memory artifacts are persisted.

## Epic 2: Conversation Orchestration Service
1. As the conversation service, I can accept a user turn and orchestrate downstream services in order.
2. As the conversation service, I can fetch and update encrypted short-term memory for the active session.
3. As a client app, I can receive a single response payload with modality and safety metadata.

## Epic 3: Emotion Detection Pipeline
1. As the emotion service, I can score lexical and semantic cues from each message.
2. As the emotion service, I can include conversation-arc and explicit-self-report signals in scoring.
3. As the conversation pipeline, I can consume a normalized emotion label with confidence.

## Epic 4: Adaptive Therapy Engine (ATE)
1. As ATE, I can map emotional state to a modality using deterministic rules and model signals.
2. As ATE, I can enforce a two-turn lock before switching modality to reduce emotional whiplash.
3. As ATE, I can return modality guidance used by prompt builder.

## Epic 5: External LLM API Integration and Prompting
1. As the LLM API client layer, I can build prompts from context + modality + safety constraints.
2. As the LLM API client layer, I can generate responses through a managed provider API without hosting models.
3. As the LLM API client layer, I can return failures as explicit errors for retry/handling upstream.

## Epic 6: Safety, Filtering, and Crisis Handling
1. As the filter service, I can evaluate every generated response before returning it.
2. As the crisis pipeline, I can classify risk on every user message in parallel.
3. As a user in high-risk flow, I receive warm crisis resources and safe response routing.

## Epic 7: Data, Privacy, and Compliance
1. As a privacy-conscious user, my raw transcript is never stored long-term.
2. As a user, I can request data export and receive an encrypted package.
3. As a user, I can trigger “Forget me” and have all recoverable data removed.

## Epic 8: Client Applications (Web + Mobile)
1. As a user, I can send and receive messages in both web and mobile clients.
2. As a user, I can see clear loading, failure, and retry states in chat.
3. As a user, I can manage privacy settings directly in client UI.

## Epic 9: Infrastructure and Local Environments
1. As a developer, I can start the full stack locally with Docker Compose.
2. As a developer, I can route requests through NGINX to internal services.
3. As a developer, I can configure environments through `.env.example` and documented variables.

## Epic 10: Observability, QA, and Release Readiness
1. As the team, we can monitor service latency/error rates and crisis safety signals.
2. As the team, we can run regression tests for modality routing and safety filters.
3. As the team, we can ship with a release checklist and rollback procedure.
