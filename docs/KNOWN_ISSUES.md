# Known Limitations & Handled Edge Cases — EduFlow AI

> **Purpose:** Honest, transparent technical ledger of current scope boundaries, edge case mitigations, and deferred non-essential features.

---

## 1. Handled Limitations & Mitigations

| Issue / Limitation | Root Cause | Implemented Mitigation |
| :--- | :--- | :--- |
| **PDF Ingestion Truncation** | Large 100+ page textbooks exceed single LLM context. | Implemented semantic chunking (600-char windows, 80-char overlap) in `retrieval.service.js` with Top-K relevance retrieval. |
| **Probabilistic JSON Output** | LLMs occasionally wrap JSON in markdown fences or omit brackets. | Built `safeExtractJson` with regex repair and schema validation before returning to UI. |
| **Watsonx IAM Key Latency** | Acquiring OAuth token on every call adds 400ms latency. | Implemented 50-minute in-memory token caching in `BobProvider.getAccessToken()`. |
| **Student Attempt Tampering** | Malicious users querying `/api/attempts/:id` of other students. | Added strict user ID verification ensuring students can only read their own attempts. |
| **Rate Limit Spikes on Generation** | Teachers accidentally clicking "Generate" multiple times. | Added route-level rate limiting (`express-rate-limit`) with HTTP 429 response. |

---

## 2. Deferred Non-Essential Features (Post-Hackathon Roadmap)
1. **Dedicated External Vector DB:** MongoDB/in-memory chunk retrieval is currently used; Qdrant or Milvus cluster can be added for multi-million document scale.
2. **Audio/Voice Interface:** Speech-to-text input for doubts is scoped for future mobile native apps.
3. **Automated LMS Sync (Canvas/Google Classroom):** LTI integration deferred to Enterprise release.
