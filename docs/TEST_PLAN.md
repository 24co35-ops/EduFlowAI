# Master Test Plan & Verification Matrix — EduFlow AI

> **Purpose:** Exhaustive test plan outlining unit, integration, and security verification loops across all EduFlow AI endpoints and AI workflows.

---

## 1. Test Execution Matrix

| Test ID | Test Scope | Method & Assertions | Expected Result | Verification Script |
| :--- | :--- | :--- | :--- | :--- |
| **TEST-01** | **Provider Failover** | Invoke `AIService.executeAITask` without IBM credentials. Assert `metadata.fallbackUsed === true`. | Fallback engine gracefully satisfies request without crashing. | `server/test_audit_fixes.js` |
| **TEST-02** | **Telemetry Tracking** | Query `/api/ai/diagnostics` after generation tasks. | Metrics record latency, request count, success rate, and active models. | `server/test_audit_fixes.js` |
| **TEST-03** | **In-Place Question Edit** | Call `PATCH /api/quizzes/:id` modifying `question`, `options`, `correctAnswer`. | Updated quiz persists exactly with modified question fields. | `server/test_audit_fixes.js` |
| **TEST-04** | **Single-Question Regeneration** | Call `POST /api/quizzes/:id/regenerate-question` on index `k`. | Question at index `k` is regenerated; all other questions untouched. | `server/test_audit_fixes.js` |
| **TEST-05** | **Deterministic MCQ Grading** | Submit exact match vs mismatch on objective questions. | Exact match gives 100%; incorrect gives 0%. No LLM hallucination. | `server/test_audit_fixes.js` |
| **TEST-06** | **Subjective Grading** | Grade conceptual short answer using rubric evaluation. | Score, feedback, covered concepts, and missing concepts extracted. | `server/test_audit_fixes.js` |
| **TEST-07** | **Remediation Modal Payload** | Request remediation for topic with `< 50%` mastery. | Valid 4-part recovery schema: concept, analogy, misconception, practice. | `server/test_audit_fixes.js` |
| **TEST-08** | **5-Factor Topic Mastery** | Compute mastery from scores `[40, 60, 90]` across difficulties. | Accurate weighted percentage with time decay and streak adjustment. | `server/test_audit_fixes.js` |
| **TEST-09** | **Lesson Plan Rate Limit** | Fire 4 rapid requests to `/api/courses/:id/lesson-plan`. | First 3 allowed; 4th safely throttled with HTTP 429. | `server/test_audit_fixes.js` |
| **TEST-10** | **Anti-IDOR Student Attempts** | Student A requests Student B's attempt record. | Returns HTTP 403 Forbidden. Data isolation strictly enforced. | `server/test_audit_fixes.js` |
| **TEST-11** | **RAG Grounding & Citations** | Query doubt solver with curriculum query vs out-of-scope query. | Curriculum query returns `[Source: Chapter X, Page Y]`; out-of-scope is redirected. | `server/test_audit_fixes.js` |

---

## 2. Test Execution Command

Run the automated verification suite directly:
```bash
node server/test_audit_fixes.js
```
All 11 tests must pass with 0 failures before any deployment or pull request.
