# Rule 03: Anti-Hallucination & Model Provenance

## 1. Zero-Hallucination Development Protocol
- Inspect real files before making changes. Never invent dependencies, file paths, model endpoints, or route signatures.
- Never claim IBM BOB / watsonx.ai executed if the local fallback ran.
- Always report truthful telemetry: `provider: "ibm_bob"` vs `provider: "fallback_engine"` / `"curriculum_engine"`.
- Never label mock or seeded demo data with deceptive text like "IBM BOB generated".

## 2. Schema Validation & Repair
- Every raw LLM response must pass through `safeExtractJson` and strict schema validators (`validateLessonPlan`, `validateQuiz`, `validateGrading`, `validateFlashcards`, `validateRemediation`).
- If an LLM returns malformed JSON or invalid schema, log the warning, attempt sanitization, and fall back safely rather than crashing the request.

## 3. Dynamic Model Configuration
- Avoid hardcoding model IDs in core business logic.
- Source model identifiers from environment variables (`WATSONX_MODEL_TEXT`, `WATSONX_MODEL_CHAT`, `WATSONX_MODEL_MULTILINGUAL`, `WATSONX_MODEL_EMBEDDING`, `WATSONX_API_VERSION`).
- Provide verified defaults (e.g. `ibm/granite-13b-instruct-v2`, `ibm/granite-13b-chat-v2`, `ibm/granite-20b-multilingual`).
