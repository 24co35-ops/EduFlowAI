# Rule 04: Testing & Verification Lifecycle

## 1. Incremental Verification
- Every feature or architectural change must be verified against an automated test suite before declaration of completion.
- Never write large chunks of unverified code. Follow the loop:
  `INSPECT → MODIFY → EXECUTE TEST → CHECK LINT/BUILD → VERIFY TELEMETRY → REPEAT`.

## 2. Mandatory Test Coverage
- **Auth & Authorization**: Role-based access (Teacher vs Student), invalid tokens, IDOR isolation on attempt records.
- **Curriculum Ingestion**: File type restrictions (PDF/Text), 10MB bounds check, chapter/topic chunking.
- **AI Gateway**: Provider failover, schema validation, latency recording, fallback metadata tagging.
- **Assessment Scoring**: Deterministic MCQ grading (100% exact match), rubric-based subjective grading, in-place edit preservation.
- **Adaptive Remediation**: Closed-loop recovery modal payload verification, 5-factor topic mastery calculation.
