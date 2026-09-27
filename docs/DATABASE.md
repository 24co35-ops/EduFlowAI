# Database Architecture & Schemas — EduFlow AI

## 1. Entity-Relationship Overview

EduFlow AI utilizes MongoDB with Mongoose ODM schemas, backed by indexes on user ownership, quiz associations, and timestamps:

```text
┌─────────────────┐           ┌──────────────────┐
│      User       │           │      Lesson      │
│  (Teacher/      │◄──1:N────-│  (5-Day Plan,    │
│   Student)      │           │   Syllabus text) │
└────────┬────────┘           └──────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐           ┌──────────────────┐
│      Quiz       │           │   FlashcardDeck  │
│  (Questions,    │◄──1:N────-│  (Front/Back,    │
│   Difficulty)   │           │   Summary)       │
└────────┬────────┘           └──────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│   QuizAttempt   │
│  (NLP scores,   │
│   feedback)     │
└─────────────────┘
```

---

## 2. Detailed Schema Definitions

### 1. `User` Schema (`server/models/User.js`)
- `name`: String, required, trimmed
- `email`: String, required, unique, lowercase, trimmed (Index: `email: 1`)
- `passwordHash`: String, required
- `role`: Enum `['teacher', 'student', 'admin']`, default `'teacher'`
- `institution`: String, default `'EduFlow Academy'`
- `grade`: String, default `'Class 10'`
- `resetToken`: String, default null
- `resetTokenExpiry`: Date, default null
- `timestamps`: true

### 2. `Lesson` Schema (`server/models/Lesson.js`)
- `teacherId`: String, required (Index: `teacherId: 1`)
- `subject`: String, required
- `syllabusFileName`: String
- `syllabusText`: String
- `overview`: String
- `plan`: Array of Day Objects:
  - `day`: Number (1–5)
  - `topic`: String
  - `duration`: String (e.g., `'45 mins'`)
  - `activities`: Array of Strings
  - `objectives`: Array of Strings
- `language`: String, default `'en'`
- `timestamps`: true

### 3. `Quiz` Schema (`server/models/Quiz.js`)
- `teacherId`: String, required (Index: `teacherId: 1`)
- `topic`: String, required
- `difficulty`: Enum `['easy', 'medium', 'hard']`, default `'medium'`
- `questions`: Array of Question Objects:
  - `question`: String, required
  - `type`: Enum `['mcq', 'short', 'truefalse']`, default `'mcq'`
  - `options`: Array of Strings
  - `correctAnswer`: String, required
  - `explanation`: String
  - `difficulty`: String
- `status`: Enum `['draft', 'published']`, default `'published'`
- `assignedGrade`: String, default `'Class 10'`
- `timestamps`: true

### 4. `Attempt` Schema (`server/models/Attempt.js`)
- `studentId`: String, required (Index: `studentId: 1`)
- `studentName`: String
- `quizId`: String, required (Index: `quizId: 1`)
- `topic`: String
- `answers`: Array of Answer Objects:
  - `questionIndex`: Number
  - `questionText`: String
  - `userAnswer`: String
  - `correctAnswer`: String
  - `isCorrect`: Boolean
  - `score`: Number (0–5)
  - `feedback`: String (Granite NLP auto-grading constructive feedback)
- `totalScore`: Number
- `maxScore`: Number
- `percentage`: Number
- `timestamps`: true

### 5. `Flashcard` Schema (`server/models/Flashcard.js`)
- `studentId`: String, required (Index: `studentId: 1`)
- `title`: String, required
- `summary`: String
- `cards`: Array of `{ front: String, back: String }`
- `timestamps`: true

---

## 3. In-Memory Dual-Mode Engine

For seamless local evaluation, hackathon judging, and continuous testing where a live MongoDB instance is not locally provisioned, EduFlow AI features an automated in-memory persistence layer (`memoryLessons`, `memoryQuizzes`, `memoryAttempts`, `memoryFlashcards`, `memoryUsers`). The database connection check in `server/config/db.js` gracefully routes queries without crashing or disrupting API execution.
