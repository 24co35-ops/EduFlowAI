# Open-Source Implementation Notes & Adaptation Map — EduFlow AI

> **Purpose:** Detailed mapping of open-source patterns to EduFlow AI subsystems, detailing specific file adaptations, architectural benefits, and avoided anti-patterns.

---

## 1. Adaptation Map

```
┌───────────────────────────────────────┬──────────────────────────────────────┬──────────────────────────────────────────┐
│ Source Pattern / Repository           │ EduFlow AI Target Subsystem          │ Architectural Benefit & Implementation   │
├───────────────────────────────────────┼──────────────────────────────────────┼──────────────────────────────────────────┤
│ IBM watsonx IAM Token Lifecycle       │ server/services/ai/bob.provider.js   │ Prevents per-request IAM auth latency    │
│ (IBM/watsonx-ai-node-sdk)             │                                      │ by caching token for 50 mins.            │
├───────────────────────────────────────┼──────────────────────────────────────┼──────────────────────────────────────────┤
│ Greedy Decoding & Schema Sanitization │ server/services/ai/validators/       │ Eliminates JSON extraction failures      │
│ (IBM/watsonx-ai-samples)              │ outputValidator.js                   │ across probabilistic model outputs.      │
├───────────────────────────────────────┼──────────────────────────────────────┼──────────────────────────────────────────┤
│ Source-Grounded RAG Chunking          │ server/services/ai/retrieval.service │ Attaches [Source: Chapter X, Page Y]     │
│ (IBM/watsonx-rag-ask-doc)             │ and prompts/doubt.js                 │ and blocks out-of-scope hallucinations.  │
├───────────────────────────────────────┼──────────────────────────────────────┼──────────────────────────────────────────┤
│ 3-Tier Adaptive Difficulty Logic      │ server/controllers/studentController │ Transparent, explainable mastery rule    │
│ (StudySnap pattern)                   │ and client/RemediationModal.jsx      │ that drives dynamic quiz recommendations.│
└───────────────────────────────────────┴──────────────────────────────────────┴──────────────────────────────────────────┘
```

---

## 2. Specific Implementation Details

### A. Watsonx Generation & Dynamic Model Selection
- **Files Modified:** `server/services/ai/bob.provider.js`, `server/services/ai/index.js`
- **What Was Adapted:**
  - Standard REST communication to `${WATSONX_URL}/ml/v1/text/generation?version=${WATSONX_API_VERSION}`.
  - Granular parameters: `decoding_method: "greedy"`, `max_new_tokens: 1500`.
  - Dynamic fallback model resolution via `process.env.WATSONX_MODEL_TEXT || 'ibm/granite-13b-instruct-v2'`.
- **What Was Not Copied:**
  - Heavy SDK dependencies that bloat server startup time or create Node version conflicts.

### B. Output Validation & JSON Repair
- **Files Modified:** `server/services/ai/validators/outputValidator.js`
- **What Was Adapted:**
  - Regex-based JSON fence extraction (`/```(?:json)?\s*([\s\S]*?)\s*```/i`).
  - Key normalization and default option fallback generation.
- **What Was Not Copied:**
  - Fragile `eval()` or unvalidated JSON parsing.

### C. Grounded Document RAG
- **Files Modified:** `server/services/ai/retrieval.service.js`, `server/services/ai/prompts/doubt.js`
- **What Was Adapted:**
  - 500-character chunking with 50-character boundary overlap.
  - Term-frequency / keyword similarity retrieval for rapid in-memory scoring.
  - Source attribution formatting.
