# EduFlow AI — Learning Intervention Intelligence Platform

> **Transforming Static Syllabi into Living Concept Graphs, Evidence-Backed Mastery, and Closed-Loop Learning Recovery**  
> **Powered by IBM watsonx.ai (Granite 13B & 20B Models)**  
> *Live Deployment:* [https://edu-flow-ai-six.vercel.app/](https://edu-flow-ai-six.vercel.app/)  
> *GitHub Repository:* [https://github.com/24co35-ops/EduFlowAI](https://github.com/24co35-ops/EduFlowAI)

---

## 1. Product Overview

EduFlow AI is an enterprise-grade **Learning Intervention Intelligence Platform** engineered for modern education institutions. Moving beyond generic "AI chatbots" and one-off lesson planning tools, EduFlow AI bridges curriculum upload to granular, evidence-based learning recovery:

1. **Curriculum Twin:** Ingests syllabus documents into an interactive, versioned digital concept graph with chapter-topic-concept hierarchies, prerequisite chains, and source citations.
2. **Learning Evidence Graph:** Maps every assessment question atomically to target concepts and cognitive levels, tracking student competencies deterministically.
3. **Concept Mastery Engine:** Computes real-time, fine-grained concept mastery scores and detects recurring misconceptions.
4. **Closed-Loop Intervention Engine:** Automatically identifies learning gaps, delivers 1-click teacher interventions, assigns student Next Best Actions, and verifies recovery through targeted Mastery Checks with measurable mastery deltas.
5. **Honest AI Provenance:** Fully compliant with IBM watsonx.ai hackathon guardrails, featuring transparent telemetry (`provider`, `model`, `latencyMs`, `fallbackUsed`) and verified RAG grounding.

---

## 2. Problem & Solution

### The Problem
- **The Generic AI Trap:** Most edtech AI platforms merely act as open-ended chatbots or ungrounded quiz generators with no curricular anchor or learning memory.
- **Invisible Learning Gaps:** Traditional gradebooks show aggregate letter grades (e.g., "72% in Physics") without identifying which foundational concept broke down.
- **Open-Loop Remediation:** Even when quizzes pinpoint weaknesses, remediation is rarely measured or verified — teachers have no proof that a student overcame a specific misconception.

### The EduFlow AI Closed Loop
```text
┌─────────────────────────────────────────────────────────────┐
│                 1. Curriculum Twin Graph                    │
│   Syllabus PDF ➔ Concept Graph + Prerequisites + Citations  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│             2. Blueprint Assessment & Evidence              │
│   Adaptive Quizzes tagged to Concepts & Cognitive Levels     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│             3. Real-Time Mastery & Gap Detection            │
│   Question-level Evidence logged to Learning Graph           │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│             4. Teacher Action Center & Dispatch             │
│   Top Weak Concepts ➔ 1-Click Targeted Intervention Assign  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│             5. Closed-Loop Mastery Check & Recovery         │
│   Student completes Check ➔ Measured Mastery Delta Recorded │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Core Features

### 👩‍🏫 Teacher Workflow
- **Teacher Action Center (NEW):** Command center showing high-priority class learning gaps, affected student counts, top detected misconceptions, and 1-click remediation assignment.
- **Curriculum Twin Explorer (NEW):** Visual interactive concept graph displaying prerequisite chains, learning competencies, source citations, and aggregated class mastery levels.
- **Syllabus to 5-Day Lesson Plan (F1):** Ingests syllabus PDF or text, generates structured 5-day plans with daily durations, learning objectives, and classroom activities.
- **In-Place Plan Editor:** Allows educators to modify topics, durations, and objectives with database persistence.
- **Auto Quiz Builder & Editor (F2):** Synthesizes MCQs, True/False, and Short Answer questions with explanations; supports single-question regeneration and in-place editing before publishing.
- **Multilingual Localization (F3):** Translates lesson plans into Hindi, Marathi, Tamil, Telugu, and Kannada using Granite 20B Multilingual.
- **Classroom Intelligence & "Who Needs Help?" (F8):** Real-time accuracy heatmaps, topic failure rate alerts, and student risk identification.

### 🧑‍🎓 Student Workflow
- **Intervention Mastery Check (NEW):** Closed-loop assessment to verify conceptual recovery after remediation, complete with instant pre/post mastery delta scoring and evidence logging.
- **Next Best Action Guidance (NEW):** Prioritized learning queue directing students to their highest-leverage review topics based on diagnostic mastery data.
- **Adaptive Practice Quizzes & Deterministic Auto-Grading (F6 & F7):** Exact match for objective questions combined with Granite NLP evaluation for subjective explanations.
- **Transparent Multi-Factor Topic Mastery Engine:** Computes weighted mastery ($40\%$ recent quiz, $25\%$ historical average, $15\%$ consistency, $10\%$ difficulty factor, $10\%$ improvement trend) across 5 mastery tiers.
- **Curriculum-Grounded AI Doubt Tutor (F4):** Conversational AI tutor with multi-turn history, syllabus bounding, and quick action chips (*"Simplify"*, *"Real-World Example"*, *"Quiz Me"*).
- **Interactive 3D Flashcards (F5):** Bullet-point executive summaries and flip study cards with mobile touch and keyboard navigation.

### 🛠️ Platform & Observability
- **Truthful AI Evidence Badges:** Displays exact model provenance (`IBM watsonx.ai Granite 13B/20B` vs Fallback engine) and real response latencies.
- **Real-Time AI Diagnostics Panel:** Live telemetry tracking latency, request counts, validation status, and active IBM Granite models without exposing sensitive credentials.
- **Dual-Mode Persistence:** Supabase Postgres integration with automated in-memory fallback for zero-setup local evaluation.

---

## 4. IBM watsonx.ai Integration Architecture

EduFlow AI utilizes real IBM watsonx.ai Granite models via a modular provider layer in `server/services/ai/`:

| Feature | Function | Target Model ID | Input | Output Format |
|---|---|---|---|---|
| **Lesson Plan** | `generateLessonPlan()` | `ibm/granite-13b-instruct-v2` | Syllabus text / PDF | 5-Day plan JSON |
| **Quiz Builder**| `generateQuiz()` | `ibm/granite-13b-instruct-v2` | Topic, difficulty | MCQ/Short answer JSON |
| **Auto-Grading** | `autoGradeAnswer()` | `ibm/granite-13b-instruct-v2` | Question, student answer | Score (0-5) + Feedback JSON |
| **Remediation** | `generateRemediation()` | `ibm/granite-13b-instruct-v2` | Weak topic, score | 3-min lesson + 3 questions JSON |
| **Flashcards** | `generateFlashcards()` | `ibm/granite-13b-instruct-v2` | Chapter text, title | Summary + 5 Cards JSON |
| **Doubt Tutor** | `solveDoubt()` | `ibm/granite-13b-chat-v2` | Student query, history | Natural language tutoring reply |
| **Translation** | `translateText()` | `ibm/granite-20b-multilingual` | Educational text | Localized Indic/English text |

*Full traceability map:* See [`docs/IBM_INTEGRATION_MAP.md`](file:///c:/Users/ASHWITH/Desktop/EduFlow/docs/IBM_INTEGRATION_MAP.md).

---

## 5. Technology Stack

- **Frontend:** React 18, Vite 5, Tailwind CSS 3.4, Lucide Icons, Axios, React Router 6
- **Backend:** Node.js, Express 4, @supabase/supabase-js, Multer, pdf-parse, Helmet, express-rate-limit, express-mongo-sanitize
- **Authentication:** Supabase Auth (email/password) + JSON Web Tokens (7d TTL)
- **AI Infrastructure:** IBM Cloud watsonx.ai (Granite 13B & 20B) with Google Gemini / Curriculum Smart Engine fallback
- **Database:** Supabase Postgres (with in-memory demo fallback when unconfigured)
- **Deployment:** Vercel Serverless

---

## 6. Quick Start & Local Development

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- A free [Supabase](https://supabase.com) project (for persistent auth & data)

### Supabase Setup (one-time)

1. Create a project at [supabase.com](https://supabase.com).
2. In your project dashboard go to **SQL Editor → New query**, and run the migrations:
   - Run [`supabase/migrations/001_profiles.sql`](supabase/migrations/001_profiles.sql) (creates `profiles` table + auto-provisioning trigger)
   - Run [`supabase/migrations/002_app_tables.sql`](supabase/migrations/002_app_tables.sql) (creates `lessons`, `quizzes`, `attempts`, `flashcards` tables + RLS policies)
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`
   - **JWT Secret** (Settings → API → JWT Settings) → `JWT_SECRET`

### Local Setup
```bash
# 1. Clone the repository
git clone https://github.com/24co35-ops/EduFlowAI.git
cd EduFlowAI

# 2. Install dependencies
npm run install:all

# 3. Configure environment
cp .env.example .env
# Edit .env and fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET

# 4. Start full-stack development server
npm run dev
```
- Client runs at: `http://localhost:5173`
- Server runs at: `http://localhost:5000`

> **No Supabase?** The app runs in in-memory demo mode. Pre-seeded accounts work. New registrations persist for the server lifetime only.


---

## 7. Pre-Seeded Demo Accounts

| Role | Email | Password | Access / Permissions |
|---|---|---|---|
| **Teacher** | `teacher@eduflow.ai` | `teacher123` | Lesson Planner, Quiz Builder, Classroom Analytics, IDOR-protected authoring |
| **Student** | `student@eduflow.ai` | `student123` | Quizzes & Practice, Flashcards, Doubt Solver, Topic Mastery, AI Remediation |

---

## 8. Verification & Test Suite

Run the master 14-step automated verification suite:
```bash
node server/test_audit_fixes.js
```
**Test Coverage:**
- Authentication guards (401 verification)
- Teacher vs Student RBAC (403 verification)
- Lesson generation & in-place update (`PUT /api/lessons/:id`)
- Quiz generation & per-question regeneration (`POST /api/quizzes/regenerate-question`)
- Student quiz grading & multi-factor mastery calculation
- AI Remediation Loop generation (`POST /api/student/remediation`)
- Curriculum doubt solver with action chips (`simplify`, `example`, `quiz_me`)
- Live diagnostic telemetry & observability metrics
- User registration validation & duplicate prevention
- Role mismatch rejection on authentication

Run the Curriculum & Closed-Loop Intervention Test Suite:
```bash
node server/test_intervention_endpoints.js
```

Run the AI Grounding & RAG Benchmark Suite:
```bash
node tests/ai/benchmark.js
```

Verify Frontend Client Build:
```bash
npm run build --prefix client
```

---

## 9. Comprehensive Documentation Index

- [PRD & Requirements (`docs/PRD.md`)](file:///c:/Users/ASHWITH/Desktop/EduFlow/docs/PRD.md)
- [System Architecture (`docs/ARCHITECTURE.md`)](file:///c:/Users/ASHWITH/Desktop/EduFlow/docs/ARCHITECTURE.md)
- [Technology Stack (`docs/TECH_STACK.md`)](file:///c:/Users/ASHWITH/Desktop/EduFlow/docs/TECH_STACK.md)
- [IBM Integration Map & Audit Trail (`docs/IBM_INTEGRATION_MAP.md`)](file:///c:/Users/ASHWITH/Desktop/EduFlow/docs/IBM_INTEGRATION_MAP.md)
- [AI Architecture & Prompts (`docs/AI_ARCHITECTURE.md`)](file:///c:/Users/ASHWITH/Desktop/EduFlow/docs/AI_ARCHITECTURE.md)
- [AI Safety & Grounding (`docs/AI_SAFETY.md`)](file:///c:/Users/ASHWITH/Desktop/EduFlow/docs/AI_SAFETY.md)
- [Security & Threat Model (`docs/SECURITY.md`)](file:///c:/Users/ASHWITH/Desktop/EduFlow/docs/SECURITY.md)
- [REST API Specification (`docs/API.md`)](file:///c:/Users/ASHWITH/Desktop/EduFlow/docs/API.md)
- [Database Schemas & Indexes (`docs/DATABASE.md`)](file:///c:/Users/ASHWITH/Desktop/EduFlow/docs/DATABASE.md)
- [UI/UX & Design System (`docs/UI_UX.md`)](file:///c:/Users/ASHWITH/Desktop/EduFlow/docs/UI_UX.md)
- [Automated Testing Suite (`docs/TESTING.md`)](file:///c:/Users/ASHWITH/Desktop/EduFlow/docs/TESTING.md)
- [Deployment Guide (`docs/DEPLOYMENT.md`)](file:///c:/Users/ASHWITH/Desktop/EduFlow/docs/DEPLOYMENT.md)
- [Troubleshooting & Diagnostics (`docs/TROUBLESHOOTING.md`)](file:///c:/Users/ASHWITH/Desktop/EduFlow/docs/TROUBLESHOOTING.md)
- [3-Minute Live Demo Script (`docs/DEMO_SCRIPT.md`)](file:///c:/Users/ASHWITH/Desktop/EduFlow/docs/DEMO_SCRIPT.md)
- [Open Source Licensing (`docs/OPEN_SOURCE_COMPONENTS.md`)](file:///c:/Users/ASHWITH/Desktop/EduFlow/docs/OPEN_SOURCE_COMPONENTS.md)
- [Limitations & Roadmap (`docs/LIMITATIONS.md`)](file:///c:/Users/ASHWITH/Desktop/EduFlow/docs/LIMITATIONS.md)
- [Final Readiness & 1000-Point Audit Report (`docs/FINAL_READINESS_REPORT.md`)](file:///c:/Users/ASHWITH/Desktop/EduFlow/docs/FINAL_READINESS_REPORT.md)

---

## 10. License

MIT License. Developed for the IBM watsonx.ai Hackathon 2026.
