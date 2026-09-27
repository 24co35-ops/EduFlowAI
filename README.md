# EduFlow AI — Intelligent Course-Content Automation & Learning Intelligence Platform

> **Powered by IBM watsonx.ai (Granite 13B & 20B Models)**  
> *Live Deployment:* [https://edu-flow-ai-six.vercel.app/](https://edu-flow-ai-six.vercel.app/)  
> *GitHub Repository:* [https://github.com/24co35-ops/EduFlowAI](https://github.com/24co35-ops/EduFlowAI)

---

## 1. Product Overview

EduFlow AI is an enterprise-grade education workflow platform that transforms static curriculum and syllabi into structured daily lesson plans, auto-generated assessments, and closed-loop personalized student remediation. Powered by **IBM watsonx.ai Granite models**, EduFlow AI automates educator administrative overhead while providing transparent, measurable visibility into student understanding.

---

## 2. Problem & Solution

### The Problem
- **Educator Burnout:** Teachers spend 10–15 hours every week manually authoring lesson plans, assembling quizzes, and grading subjective answers.
- **Disconnected Learning Gaps:** Students lack instant, curriculum-grounded assistance outside class and cannot pinpoint their specific conceptual weak areas.
- **Generic "AI Chatbots":** Most AI tools act as open-ended chatbots without curriculum grounding, structured output validation, or closed-loop remediation.

### The EduFlow AI Closed Loop
```text
Curriculum / Syllabus PDF
           ↓
Plan: 5-Day Structured Lesson Plan (Granite 13B Instruct)
           ↓
Teach: Multilingual Content in 5+ Indian Languages (Granite 20B Multilingual)
           ↓
Assess: Adaptive Quizzes & NLP Auto-Grading (Granite 13B Instruct)
           ↓
Diagnose: Transparent 5-Factor Topic Mastery Engine
           ↓
Remediate: 3-Min AI Explanations & Targeted Practice Checks (Granite 13B)
           ↓
Mastery Achieved ↺
```

---

## 3. Core Features

### 👩‍🏫 Teacher Workflow
- **Syllabus to 5-Day Lesson Plan (F1):** Ingests PDF or raw text, generates structured 5-day plans with daily durations, learning objectives, and classroom activities.
- **In-Place Plan Editor:** Allows educators to modify topics, durations, and objectives with database persistence.
- **Auto Quiz Builder & Editor (F2):** Synthesizes MCQs, True/False, and Short Answer questions with explanations; supports single-question regeneration and in-place editing before publishing.
- **Multilingual Localization (F3):** Translates lesson plans into Hindi, Marathi, Tamil, Telugu, and Kannada using Granite 20B Multilingual.
- **Classroom Intelligence & "Who Needs Help?" (F8):** Real-time accuracy heatmaps, topic failure rate alerts, and student risk identification with 1-click remediation dispatch.

### 🧑‍🎓 Student Workflow
- **Adaptive Practice Quizzes & NLP Auto-Grading (F6 & F7):** Instant grading of objective questions combined with Granite NLP evaluation of short answers with constructive feedback.
- **Transparent Multi-Factor Topic Mastery Engine:** Computes weighted mastery ($40\%$ recent quiz, $25\%$ historical average, $15\%$ consistency, $10\%$ difficulty factor, $10\%$ improvement trend) across 5 mastery tiers.
- **Closed-Loop AI Remediation (P1):** Generates a 3-minute explanation, real-world analogy, misconception alert, and 3 interactive practice questions for struggling students.
- **Curriculum-Grounded AI Doubt Tutor (F4):** Conversational AI tutor with multi-turn history, syllabus bounding, and quick action chips (*"Simplify"*, *"Real-World Example"*, *"Quiz Me"*).
- **Interactive 3D Flashcards (F5):** Bullet-point executive summaries and flip study cards with mobile touch and keyboard navigation.

### 🛠️ Platform & Observability
- **Real-Time AI Diagnostics Panel:** Live telemetry tracking latency, request counts, validation status, and active IBM Granite models without exposing sensitive credentials.
- **Dual-Mode Persistence:** MongoDB Atlas cluster integration with automated in-memory fallback for zero-setup local evaluation.

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
- **Backend:** Node.js, Express 4, Mongoose 8, Multer, pdf-parse, Helmet, express-rate-limit, express-mongo-sanitize
- **Authentication:** Bcryptjs (10 rounds), JSON Web Tokens (7d TTL)
- **AI Infrastructure:** IBM Cloud watsonx.ai (Granite 13B & 20B) with Google Gemini / Curriculum Smart Engine fallback
- **Database:** MongoDB Atlas / In-Memory dual-mode store
- **Deployment:** Vercel Serverless

---

## 6. Quick Start & Local Development

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Setup
```bash
# 1. Clone the repository
git clone https://github.com/24co35-ops/EduFlowAI.git
cd EduFlowAI

# 2. Install dependencies
npm run install:all

# 3. Configure environment
cp .env.example .env

# 4. Start full-stack development server
npm run dev
```
- Client runs at: `http://localhost:5173`
- Server runs at: `http://localhost:5000`

---

## 7. Pre-Seeded Demo Accounts

| Role | Email | Password | Access / Permissions |
|---|---|---|---|
| **Teacher** | `teacher@eduflow.ai` | `teacher123` | Lesson Planner, Quiz Builder, Classroom Analytics, IDOR-protected authoring |
| **Student** | `student@eduflow.ai` | `student123` | Quizzes & Practice, Flashcards, Doubt Solver, Topic Mastery, AI Remediation |

---

## 8. Verification & Test Suite

Run the master 11-step automated verification suite:
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
