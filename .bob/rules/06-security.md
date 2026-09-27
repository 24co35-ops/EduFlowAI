# Rule 06: Security & Data Isolation

## 1. Secrets & Credentials Management
- Never commit secrets, IBM Cloud API keys, watsonx project IDs, or JWT secret tokens to git.
- Use `.env` locally and `.env.example` as a template.
- Never expose server-side credentials to client-side bundles (e.g. `VITE_` variables must not contain backend secrets).

## 2. Input Sanitization & File Uploads
- Limit uploaded curriculum PDFs to a strict 10MB threshold.
- Sanitize user inputs and prompt templates to protect against prompt injection attacks.
- Enforce strict parameter type checking on all routes.

## 3. Multi-Tenant Course Isolation & Anti-IDOR
- All course resources (`/api/courses/:id/...`) must verify teacher ownership (`verifyCourseOwnership`).
- Student attempts and analytics must only be visible to the owning student or the instructor of that course.
