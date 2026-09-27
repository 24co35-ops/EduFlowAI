# Open-Source Research & Architecture Matrix — EduFlow AI

> **Purpose:** Comprehensive analysis of candidate open-source repositories to accelerate and harden EduFlow AI without violating intellectual property or software licenses.

---

## 1. Candidate Repository Classification Matrix

| Repository | Organization / Author | License | Category / Focus Area | Classification | Integration Decision |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **`watsonx-ai-node-sdk`** | IBM | Apache 2.0 | Official Node.js watsonx.ai SDK | **A** | Direct pattern adaptation for IAM token lifecycle and generation endpoints. |
| **`watsonx-ai-samples`** | IBM | Apache 2.0 | watsonx prompt chaining & RAG samples | **A** | Reference prompt structure and generation parameter presets (`decoding_method: greedy`). |
| **`watsonx-rag-ask-doc`** | IBM | Apache 2.0 | Document-grounded PDF RAG pipeline | **A** | Chunking bounds (500–900 tokens) and citation formatting pattern (`[Source: Chapter X, Page Y]`). |
| **`wx-llms-powered-examples`** | IBM | Apache 2.0 | Granite RAG & structured extraction | **B** | Architecture reference for Granite few-shot extraction prompts. |
| **`StudySnap`** | VMPRANAV | MIT | MERN study platform & adaptive quizzes | **B** | Inspiration for mastery scoring and adaptive quiz difficulty threshold logic. |
| **`RAG-ASSIST-Prototype`** | EonixLabs | MIT | Vite + Express + RAG assistant | **B** | Clean modular service organization pattern for AI providers. |
| **`lextures`** | StudyDrift | AGPL-3.0 | Adaptive learning platform & IRT | **C** | **REJECTED for code reuse** due to viral copyleft license. Studied purely for conceptual domain understanding. |
| **`qdrant` / `pgvector`** | Qdrant / pgvector | Apache 2.0 / PostgreSQL | Dedicated vector similarity search | **B** | Reference for vector cosine indexing. Deferred dedicated external DB in favor of fast in-memory/MongoDB chunk retrieval for hackathon MVP. |

*Classification Legend:*
- **A**: Directly reusable patterns & compatible permissive license (MIT / Apache 2.0).
- **B**: Architectural & design pattern reference only; clean-room implementation.
- **C**: Rejected due to restrictive license (e.g. AGPL-3.0) or architectural mismatch.

---

## 2. Deep Dive: Key Reference Repositories

### 1. `IBM/watsonx-ai-node-sdk` (Apache 2.0)
- **Key Findings:**
  - Token endpoint: `https://iam.cloud.ibm.com/identity/token` with `grant_type=urn:ibm:params:oauth:grant-type:apikey`.
  - Watsonx endpoint: `${WATSONX_URL}/ml/v1/text/generation?version=${WATSONX_API_VERSION}`.
  - Required headers: `Authorization: Bearer <token>`, `Content-Type: application/json`.
  - Body payload: `{ model_id, input, parameters: { max_new_tokens, decoding_method, temperature }, project_id }`.
- **Adaptation in EduFlow AI:**
  Implemented in `server/services/ai/bob.provider.js` with 50-minute proactive token caching and graceful error fallback.

### 2. `IBM/watsonx-rag-ask-doc` (Apache 2.0)
- **Key Findings:**
  - Semantic chunking with 10-15% token overlap prevents boundary context loss.
  - Strict grounding prompt: explicit instruction to reject out-of-syllabus questions with helpful redirection.
- **Adaptation in EduFlow AI:**
  Implemented in `server/services/ai/retrieval.service.js` and `server/services/ai/prompts/doubt.js`, attaching source chapter and page numbers to every doubt answer.

### 3. `VMPRANAV/StudySnap` (MIT)
- **Key Findings:**
  - Adaptive quiz tiering: `< 50%` → Easy, `50% - 79%` → Medium, `≥ 80%` → Hard.
  - Practice quiz generation focusing on lowest mastery subtopics.
- **Adaptation in EduFlow AI:**
  Implemented in `server/controllers/studentController.js` and `client/src/components/RemediationModal.jsx`.

---

## 3. License Audit & Legal Compliance Summary
- All directly adapted code structures adhere to **MIT** or **Apache 2.0** licensing.
- No copyleft (GPL/AGPL) code has been copied into the repository.
- Full third-party notices and copyright acknowledgments are documented in `docs/THIRD_PARTY_NOTICES.md`.
