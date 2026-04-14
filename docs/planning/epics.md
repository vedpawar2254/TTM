# TalktoMe Epics

## Epic 1: Product Foundations and Access
- Define user personas, session goals, and first-session disclosure UX.
- Implement authentication, session lifecycle, and incognito mode controls.
- Ship baseline onboarding and consent flow for AI companion usage.

## Epic 2: Conversation Orchestration Service
- Build turn orchestration API in `services/conversation`.
- Integrate Redis short-term memory with 7-day TTL behavior.
- Add context assembly rules and modality-aware handoff contracts.

## Epic 3: Emotion Detection Pipeline
- Implement lexical, semantic, conversation-arc, and explicit signal modules.
- Add aggregation logic and confidence scoring in `classifier.py`.
- Expose a stable API contract to ATE and crisis pipeline consumers.

## Epic 4: Adaptive Therapy Engine (ATE)
- Implement modality selector with 2-turn mode-lock behavior.
- Build modality strategy modules (validation, CBT, journaling, mindfulness, SFBT, narrative).
- Add prompt template selection and response shaping metadata.

## Epic 5: External LLM API Integration and Prompting
- Build external LLM provider client wrapper and retry/error strategy.
- Implement prompt builder that combines safety, modality, and context blocks.
- Add structured output contract for downstream response filtering.

## Epic 6: Safety, Filtering, and Crisis Handling
- Implement response safety checks and crisis recheck on every output.
- Build dedicated crisis classifier and risk-threshold routing logic.
- Add resource-aware crisis responses and warm support messaging.

## Epic 7: Data, Privacy, and Compliance
- Implement encrypted client-to-server payload handling.
- Build long-term memory summaries/theme vectors without transcript storage.
- Implement “Forget me” deletion workflow and data export pipeline.

## Epic 8: Client Applications (Web + Mobile)
- Build initial chat UI shells and shared interaction patterns.
- Integrate session creation, message streaming, and error states.
- Implement privacy controls (incognito, export, delete) in settings UX.

## Epic 9: Infrastructure and Local Environments
- Finalize Docker-based local development stack.
- Configure NGINX routing for service entry points and health checks.
- Add environment configuration, service discovery, and deployment docs.

## Epic 10: Observability, QA, and Release Readiness
- Define outcome metrics (not engagement metrics) and monitoring dashboards.
- Add test strategy across unit, integration, and safety regression suites.
- Establish release checklist, rollback strategy, and runbooks.
