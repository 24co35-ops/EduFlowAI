# System Architecture — EduFlow AI

## 1. High-Level Architecture Diagram

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (React 18 + Vite)                      │
│  ├── Tailwind CSS Dark System (Slate-950, Indigo, Emerald Accents)      │
│  ├── Role-Based Protected Routes (Teacher vs Student Portals)           │
│  ├── Interactive Modules: Lesson Planner, Quiz Builder, Doubt Solver,  │
│  │   Flashcards 3D, Analytics Dashboard, AI Remediation Modal          │
│  └── Live AI Diagnostics & Telemetry Panel                             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (JWT Bearer Token)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        API & SERVER LAYER (Express 4)                  │
│  ├── Security: Helmet, MongoSanitize, CORS Allowlist, Rate Limiters    │
│  ├── Authentication: Bcrypt (10 rounds) + Signed JWT (7d)              │
│  ├── Role Guards: requireRole('teacher' | 'student')                   │
│  ├── Resource Ownership & IDOR Protection Verification                 │
│  └── Telemetry & Safe Observability Service (telemetry.js)             │
└──────────────┬──────────────────────────────────────────┬──────────────┘
               │                                          │
               ▼                                          ▼
┌──────────────────────────────┐        ┌────────────────────────────────┐
│       DATA PERSISTENCE       │        │      MODULAR AI SUBSYSTEM      │
│  ├── MongoDB / Mongoose      │        │  ├── Central Orchestrator      │
│  │   (Users, Lessons,        │        │  ├── Output Schema Validator   │
│  │    Quizzes, Attempts,     │        │  ├── Bounded Retry & Repair    │
│  │    Flashcards, Chats)     │        │  ├── Telemetry & Metrics       │
│  └── In-Memory Demo Fallback │        └───────┬──────────────┬─────────┘
│      (Zero-setup local run)  │                │              │
└──────────────────────────────┘                ▼              ▼
                                     ┌─────────────────┐ ┌───────────────┐
                                     │  IBM watsonx.ai │ │   FALLBACK    │
                                     │  Granite 13B    │ │   Gemini /    │
                                     │  Granite 20B    │ │ Smart Engine  │
                                     └─────────────────┘ └───────────────┘
```

---

## 2. Directory Structure

```text
EduFlow/
├── api/
│   └── index.js                      # Serverless entrypoint for Vercel
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Sticky navigation with Diagnostics trigger
│   │   │   ├── Sidebar.jsx           # Role-based sidebar navigation
│   │   │   ├── DiagnosticPanel.jsx   # Real-time AI observability drawer
│   │   │   └── RemediationModal.jsx  # AI-generated closed-loop remediation modal
│   │   ├── pages/
│   │   │   ├── AuthPages.jsx         # Sign in, register, password reset
│   │   │   ├── TeacherDashboard.jsx  # Educator control center
│   │   │   ├── StudentDashboard.jsx  # Student learning portal
│   │   │   ├── LessonPlannerPage.jsx # F1 & F3 Syllabus generator & editor
│   │   │   ├── QuizBuilderPage.jsx   # F2 Auto Quiz builder & editor
│   │   │   ├── QuizAttemptPage.jsx   # F6 & F7 Student quiz attempt & grading
│   │   │   ├── FlashcardsPage.jsx    # F5 3D flip study cards & summary
│   │   │   ├── DoubtSolverPage.jsx   # F4 Live AI tutoring chat
│   │   │   ├── ClassAnalyticsPage.jsx# F8 Classroom heatmaps & "Who Needs Help?"
│   │   │   └── StudentProgressPage.jsx # F8 Multi-factor mastery analytics
│   │   └── services/
│   │       └── api.js                # Axios client with 401 auto-redirect
│   └── dist/                         # Production build bundle
├── server/
│   ├── config/
│   │   └── db.js                     # MongoDB connection with fallback toggle
│   ├── controllers/
│   │   ├── authController.js         # Register, login, reset password
│   │   ├── lessonController.js       # Lesson generation, edit, delete, translate
│   │   ├── quizController.js         # Quiz generation, edit, regen, grading
│   │   └── studentController.js      # Flashcards, progress, doubt, remediation
│   ├── middleware/
│   │   └── auth.js                   # JWT protect and requireRole middlewares
│   ├── models/
│   │   ├── User.js, Lesson.js, Quiz.js, Attempt.js, Flashcard.js, Chat.js
│   ├── routes/
│   │   ├── auth.routes.js, lesson.routes.js, quiz.routes.js, student.routes.js
│   ├── services/
│   │   ├── bob.service.js            # Backward-compatible AI service bridge
│   │   └── ai/
│   │       ├── index.js              # Master AI Orchestrator
│   │       ├── provider.js           # Base AI provider contract
│   │       ├── bob.provider.js       # IBM watsonx.ai Granite 13B & 20B provider
│   │       ├── fallback.provider.js  # Gemini & Smart Curriculum Engine provider
│   │       ├── telemetry.js          # In-memory safe request telemetry
│   │       ├── prompts/              # Structured prompt templates with delimiters
│   │       ├── schemas/              # JSON schemas for generation tasks
│   │       └── validators/
│   │           └── outputValidator.js# Schema, semantic, and deduplication validator
│   ├── utils/
│   │   ├── mailer.js                 # Password reset email utility
│   │   └── pdfParser.js              # PDF text extractor (pdf-parse)
│   ├── server.js                     # Main Express server and health route
│   └── test_audit_fixes.js           # Master 11-step automated verification suite
└── docs/                             # Complete specification & audit documentation
```

---

## 3. Data Flow & AI Orchestration Sequence

1. **User Request:** Frontend sends authenticated POST request with JWT header.
2. **Security & RBAC:** Express middleware validates rate limits, sanitizes NoSQL inputs, verifies JWT signature, and checks role permissions.
3. **AI Task Execution:** Controller delegates to `aiService.executeAITask()`.
4. **Primary Engine:** If IBM credentials exist, `bob.provider.js` acquires IAM OAuth token and calls IBM Granite 13B/20B endpoint.
5. **Fallback Safety:** If IBM call fails or is unconfigured, `fallback.provider.js` executes without crashing.
6. **Output Validation:** Raw text passes through `outputValidator.js` to ensure valid JSON schema, non-empty arrays, correct answer matching, and question deduplication.
7. **Telemetry Recording:** Safe metadata (latency, provider, model, success status) is logged in `telemetry.js`.
8. **Persistence:** Graded attempts, created lessons, and generated quizzes are persisted to MongoDB (or memory store in dev mode).
9. **UI Rendering:** Client renders responsive cards, flip animations, and interactive feedback.
