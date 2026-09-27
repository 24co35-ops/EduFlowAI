# Product Requirements Document (PRD) — EduFlow AI

**Product Name:** EduFlow AI  
**Version:** 2.0 Enterprise Hardened  
**Primary Engine:** IBM BOB (watsonx.ai Granite 13B & 20B)  
**Target Users:** K-12 Educators, Coaching Institutions, School Students  

---

## 1. Problem Statement

Educators in India and globally face severe administrative overhead, spending 10–15 hours every week manually converting syllabi into daily lesson plans, authoring quizzes, and grading subjective answers. Concurrently, students lack immediate, curriculum-grounded doubt assistance outside class hours and struggle to identify their specific conceptual weaknesses before formal examinations.

## 2. Solution & Core Loop

EduFlow AI closes the educational loop by connecting curriculum intelligence to automated teacher preparation and student remediation:

```text
Curriculum / Syllabus
        ↓
Plan: 5-Day Structured Lesson Plan (Granite 13B)
        ↓
Teach: Multilingual Content in 5+ Indian Languages (Granite 20B)
        ↓
Assess: Adaptive Quizzes & NLP Auto-Grading (Granite 13B)
        ↓
Diagnose: Transparent 5-Factor Mastery Analytics
        ↓
Remediate: 3-Min AI Explanations & Targeted Practice Loops
        ↓
Mastery Achieved ↺
```

---

## 3. User Personas

### 1. Educator (Dr. Anita Sharma)
- **Pain Point:** Overworked with manual lesson planning, test creation, and grading paperwork.
- **Goals:** Upload a syllabus PDF, receive a 5-day structured lesson plan, generate adaptive quizzes in seconds, and see exactly which students need help.

### 2. Student (Rohan Gupta)
- **Pain Point:** Struggles with complex science concepts (e.g. Ohm's Law, Resistors), hesitates to ask doubts in class, and lacks instant feedback.
- **Goals:** Ask doubts in plain language, flip revision flashcards on mobile, take practice quizzes with instant NLP grading, and get targeted remediation on weak topics.

---

## 4. Key Functional Requirements

| Code | Module | Requirements |
|---|---|---|
| **F1** | **Lesson Planner** | Upload syllabus PDF or raw text; auto-extract text; generate 5-day structured lesson plan with daily topics, objectives, durations, and activities; allow in-place teacher editing; export to PDF. |
| **F2** | **Auto Quiz Builder** | Generate MCQ, True/False, and Short Answer questions by topic and difficulty; allow regenerating individual questions; edit before publishing. |
| **F3** | **Multilingual Localization** | Translate lesson plans and study materials into Hindi, Marathi, Tamil, Telugu, and Kannada using Granite 20B Multilingual. |
| **F4** | **AI Doubt Solver** | Multi-turn conversational tutor bounded by syllabus scope; support instant action chips ("Simplify", "Real-World Example", "Quiz Me"). |
| **F5** | **Flashcards & Summary** | Extract key principles from textbook text into bullet-point summaries and 3D interactive flashcards with flip and mastery tracking. |
| **F6 & F7** | **Quiz Attempt & Auto-Grading** | Instant scoring for objective questions; NLP auto-grading with explanatory feedback for short answers. |
| **F8** | **Learning Intelligence & Analytics** | Multi-factor topic mastery calculation; classroom accuracy heatmaps; "Who Needs Help?" student risk table with direct remediation dispatch. |
| **P1** | **Closed-Loop AI Remediation** | Generate 3-minute explanation, real-world analogy, misconception alert, and 3 interactive practice questions for struggling students. |

---

## 5. Non-Functional Requirements

- **Security:** Bcrypt password hashing, JWT with role-based access control (RBAC), IDOR protection on all resources, MongoDB injection sanitization, Helmet headers.
- **Reliability:** Dual-mode persistence (MongoDB + in-memory store) and AI provider fallback (IBM BOB $\to$ Gemini / Smart Curriculum Engine) with 0 crash guarantee.
- **Performance:** Sub-500ms API response time, sub-3s AI generation latency with caching.
- **Accessibility:** WCAG 2.1 AA compliant colors, keyboard navigation, fully responsive from 320px mobile to 4K desktop.
