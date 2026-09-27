# AGENTS.md — IBM Bob & AI Agent Guidelines for EduFlow AI

Welcome to the **EduFlow AI** codebase. This file specifies operational rules, role boundaries, and workflow conventions for IBM Bob, Antigravity, and other collaborative development agents.

---

## 1. Project Philosophy
EduFlow AI is an Intelligent Course Content Automation system engineered for the IBM Hackathon 2026.
It connects uploaded curriculum to structured teaching content, deterministic & AI assessments, adaptive mastery tracking, and grounded doubt resolution.

---

## 2. Core Architectural Principles

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  React 18 + Vite + Tailwind CSS + Lucide Icons             │
│  Teacher Workflow  |  Student Workflow  | Observability     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON
┌──────────────────────────────▼──────────────────────────────┐
│                      Express API Gateway                    │
│  Auth (JWT/bcrypt) | Course Isolation | Validation         │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                      AI Gateway Layer                       │
│  server/services/ai/                                        │
│  ├── AIService (Orchestrator)                               │
│  ├── BobProvider (IBM watsonx.ai Granite 13B / 20B)         │
│  ├── FallbackProvider (Curriculum Smart Engine / Gemini)    │
│  ├── telemetry (Latency, Fallback status, Model telemetry)  │
│  ├── validators (Schema validation & JSON sanitization)     │
│  └── prompts (Domain-specific structured templates)        │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Persistence Layer                        │
│  MongoDB / Mongoose (Users, Courses, Quizzes, Attempts)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Strict Development Guardrails

1. **Zero Fake Claims**:
   - Never claim IBM BOB / watsonx.ai produced an output if the local fallback engine generated it.
   - All AI responses must carry truthful metadata (`provider`, `model`, `latencyMs`, `fallbackUsed`).

2. **Deterministic Grading Separation**:
   - Multiple Choice and True/False questions MUST be scored deterministically (exact match).
   - IBM Granite is reserved for subjective short-answer feedback, misconception explanation, and remediation.

3. **Curriculum Grounding (RAG)**:
   - AI doubt answers and quiz questions must be grounded in course curriculum chunks with citations (`[Source: Chapter X, Page Y]`).
   - Out-of-scope queries must be politely rejected or redirected rather than hallucinating answers.

4. **Human-in-the-Loop Review**:
   - Quizzes start in `draft` mode. Teachers must be able to edit questions, toggle difficulty, and regenerate individual items before publishing.

5. **Security & Secrets**:
   - Never commit `.env` files or API keys.
   - Always verify course ownership and student attempt isolation (anti-IDOR).

---

## 4. Verification Commands

- **Backend Health & Logic Tests**: `node server/test_audit_fixes.js`
- **Frontend Build Verification**: `npm run build --prefix client`
- **Full Application Start**: `npm run dev`
