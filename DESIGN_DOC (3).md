# Design Document
## EduFlow AI — Intelligent Course Content Automation Tool

**Version:** 1.0  
**Date:** August 2026  
**Type:** System Design & Architecture

---

## 1. System Architecture

### 1.1 High-Level Design

EduFlow AI follows a **three-tier architecture**:

```
[Browser Client]  ──►  [Node.js API Server]  ──►  [IBM BOB / watsonx.ai]
                                │
                         [MongoDB Atlas]
                                │
                      [IBM Cloud Object Storage]
```

- The **client** (React SPA) handles all UI interactions.
- The **server** (Express) manages business logic, auth, and BOB orchestration.
- **BOB** (watsonx.ai) is invoked for every AI-powered feature via prompt chains.
- **MongoDB** stores all persistent data (users, lessons, quizzes, results).
- **IBM COS** stores uploaded files (PDFs, syllabi).

---

## 2. Component Design

### 2.1 Authentication Flow

```
User → Login Page
         │
         ▼
    POST /api/auth/login
         │
    Validate credentials (bcrypt)
         │
    Issue JWT (expires 7d)
         │
    Client stores token in memory
         │
    All subsequent requests → Authorization: Bearer <token>
```

- Roles: `teacher` | `student` | `admin`
- Role-based middleware guards all protected routes.

---

### 2.2 Lesson Plan Generation Flow

```
Teacher uploads PDF
      │
      ▼
POST /api/lessons/generate
      │
   Multer saves file → IBM COS
      │
   pdf-parse extracts text
      │
   Text + system prompt → BOB (watsonx.ai)
      │
   BOB returns structured lesson plan (JSON)
      │
   Saved to MongoDB lessons collection
      │
   Response returned to client → Rendered as editable plan
```

**BOB Prompt Template:**
```
System: You are an expert curriculum designer. Given the syllabus below, 
generate a structured 5-day lesson plan. Respond only in JSON with keys: 
day, topic, duration, activities[], learning_objectives[].

Syllabus: {{extracted_text}}
```

---

### 2.3 Quiz Generation Flow

```
Teacher inputs topic / chapter
      │
      ▼
POST /api/quizzes/generate
      │
   Build prompt with difficulty level
      │
   BOB returns quiz JSON
   (question, options[], correct_answer, difficulty, explanation)
      │
   Saved to MongoDB quizzes collection
      │
   Teacher can preview + edit before publishing
      │
   Published quiz assigned to student group
```

---

### 2.4 Student Doubt Solver Flow

```
Student types question in chat
      │
      ▼
WebSocket message → server
      │
   Prepend system context:
   "You are a tutor for [subject]. Syllabus: {{syllabus_summary}}.
    Only answer questions within this scope."
      │
   Full conversation history + new message → BOB
      │
   BOB streams response → client renders in real-time
      │
   Chat saved to MongoDB chats collection
```

---

### 2.5 Auto-Grading Flow

```
Student submits short-answer quiz
      │
      ▼
POST /api/quizzes/grade
      │
   For each answer:
   BOB prompt: "Question: {{q}} | Expected: {{expected}} | Student answer: {{answer}}
                Score out of 5 and give one-line feedback. Respond in JSON."
      │
   Aggregate scores → attempt saved to MongoDB
      │
   Result + feedback returned to student instantly
```

---

## 3. Database Schema

### 3.1 Users
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "passwordHash": "string",
  "role": "teacher | student | admin",
  "institution": "string",
  "createdAt": "Date"
}
```

### 3.2 Lessons
```json
{
  "_id": "ObjectId",
  "teacherId": "ObjectId",
  "subject": "string",
  "syllabusFileUrl": "string",
  "plan": [
    {
      "day": 1,
      "topic": "string",
      "duration": "45 mins",
      "activities": ["string"],
      "objectives": ["string"]
    }
  ],
  "language": "en | hi | mr | ta | te | kn",
  "createdAt": "Date"
}
```

### 3.3 Quizzes
```json
{
  "_id": "ObjectId",
  "teacherId": "ObjectId",
  "topic": "string",
  "questions": [
    {
      "question": "string",
      "type": "mcq | short | truefalse",
      "options": ["string"],
      "correctAnswer": "string",
      "difficulty": "easy | medium | hard",
      "explanation": "string"
    }
  ],
  "assignedTo": ["studentId"],
  "publishedAt": "Date"
}
```

### 3.4 Attempts
```json
{
  "_id": "ObjectId",
  "studentId": "ObjectId",
  "quizId": "ObjectId",
  "answers": [
    { "questionId": "string", "answer": "string", "score": 4, "feedback": "string" }
  ],
  "totalScore": 32,
  "maxScore": 40,
  "submittedAt": "Date"
}
```

---

## 4. API Design

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register teacher or student |
| POST | `/api/auth/login` | Login, returns JWT |

### Lessons
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/lessons/generate` | Upload syllabus → generate lesson plan |
| GET | `/api/lessons` | Get all lessons for logged-in teacher |
| GET | `/api/lessons/:id` | Get specific lesson |

### Quizzes
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/quizzes/generate` | Generate quiz from topic |
| POST | `/api/quizzes/grade` | Auto-grade student attempt |
| GET | `/api/quizzes` | List quizzes |
| POST | `/api/quizzes/:id/publish` | Publish to students |

### Student
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/flashcards/generate` | Generate flashcards from pasted text |
| GET | `/api/progress` | Get student performance summary |
| WebSocket | `/chat` | Real-time doubt solver |

---

## 5. UI/UX Design

### 5.1 Key Screens

| Screen | User | Description |
|---|---|---|
| Dashboard | Both | Role-based landing page with quick actions |
| Lesson Planner | Teacher | Upload syllabus → view/edit generated plan |
| Quiz Builder | Teacher | Generate, edit, publish quizzes |
| Student Home | Student | Assigned quizzes, flashcard decks, chat |
| Doubt Chat | Student | BOB-powered chat interface |
| Analytics | Teacher | Class performance, weak areas heatmap |
| Progress | Student | Personal score history, streak |

### 5.2 Design Principles
- **Mobile-first** — many students access on phones
- **Low-bandwidth friendly** — avoid heavy assets
- **Multilingual UI** — language toggle in header
- **Minimal clicks** — core tasks in ≤ 3 clicks

---

## 6. Security Design

| Concern | Mitigation |
|---|---|
| Auth | JWT with expiry + refresh tokens |
| File uploads | Type validation, size limit (10MB), COS isolation |
| BOB prompt injection | Input sanitisation before prompt construction |
| Data privacy | Student data scoped by institution |
| Secrets | All keys in `.env`, never committed |

---

## 7. Scalability Considerations

- **BOB rate limits:** Queue BOB requests using a job queue (Bull/Redis) for batch operations like generating 30 quizzes at once.
- **Caching:** Cache BOB responses for identical prompts (Redis, TTL 24h) to reduce API costs.
- **Horizontal scaling:** Stateless Express server — scale via IBM Code Engine replicas.
- **File processing:** Offload PDF parsing to async worker, return job ID to client, poll for result.
