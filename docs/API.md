# REST API Specification — EduFlow AI

**Base URL:** `/api`  
**Authentication:** Header `Authorization: Bearer <JWT_TOKEN>`  
**Response Structure:** Standard JSON object (`{ success: true, ... }` or `{ success: false, message: ... }`)  

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
- **Body:** `{ name, email, password, role: 'teacher'|'student', institution, grade }`
- **Response:** `201 Created` `{ success: true, token, user }`

### `POST /api/auth/login`
- **Body:** `{ email, password }`
- **Response:** `200 OK` `{ success: true, token, user }`

### `GET /api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` `{ success: true, user }`

### `POST /api/auth/forgot-password`
- **Body:** `{ email }`
- **Response:** `200 OK` `{ success: true, message }`

### `POST /api/auth/reset-password/:token`
- **Body:** `{ password }`
- **Response:** `200 OK` `{ success: true, message }`

---

## 2. Lesson Planning Endpoints (Teacher Only)

### `POST /api/lessons/generate`
- **Headers:** `Content-Type: multipart/form-data`
- **Form Fields:** `subject`, `syllabusText`, `language`, `syllabus` (optional PDF file)
- **Response:** `201 Created` `{ success: true, lesson, _aiMetadata }`

### `PUT /api/lessons/:id`
- **Body:** `{ subject, overview, plan, language }`
- **Response:** `200 OK` `{ success: true, lesson }`

### `DELETE /api/lessons/:id`
- **Response:** `200 OK` `{ success: true, message }`

### `POST /api/lessons/translate`
- **Body:** `{ lessonId, targetLang }`
- **Response:** `200 OK` `{ success: true, translatedContent, targetLanguage }`

### `GET /api/lessons`
- **Response:** `200 OK` `{ success: true, lessons }`

---

## 3. Quiz & Assessment Endpoints

### `POST /api/quizzes/generate` (Teacher Only)
- **Body:** `{ topic, difficulty: 'easy'|'medium'|'hard', questionCount, assignedGrade }`
- **Response:** `201 Created` `{ success: true, quiz }`

### `PUT /api/quizzes/:id` (Teacher Only)
- **Body:** `{ topic, difficulty, questions, status }`
- **Response:** `200 OK` `{ success: true, quiz }`

### `POST /api/quizzes/regenerate-question` (Teacher Only)
- **Body:** `{ topic, difficulty, type }`
- **Response:** `200 OK` `{ success: true, question }`

### `POST /api/quizzes/grade` (Student Only)
- **Body:** `{ quizId, answers: [ ... ] }`
- **Response:** `201 Created` `{ success: true, attempt: { totalScore, maxScore, percentage, answers } }`

### `GET /api/quizzes`
- **Response:** `200 OK` `{ success: true, quizzes }`

### `GET /api/quizzes/attempts`
- **Response:** `200 OK` `{ success: true, attempts }`

---

## 4. Student & Learning Intelligence Endpoints

### `POST /api/student/flashcards/generate` (Student Only)
- **Body:** `{ text, title }`
- **Response:** `201 Created` `{ success: true, deck: { title, summary, cards } }`

### `GET /api/student/flashcards` (Student Only)
- **Response:** `200 OK` `{ success: true, decks }`

### `GET /api/student/progress` (Student Only)
- **Response:** `200 OK` `{ success: true, summary: { totalQuizzesTaken, averageScore, currentStreakDays, weakTopics, topicMastery, recentAttempts } }`

### `POST /api/student/doubt`
- **Body:** `{ message, syllabusScope, history, action: 'standard'|'simplify'|'example'|'quiz_me' }`
- **Response:** `200 OK` `{ success: true, reply }`

### `POST /api/student/remediation`
- **Body:** `{ topic, studentScore, weakSubtopics }`
- **Response:** `200 OK` `{ success: true, remediation: { topic, explanation, realWorldExample, commonMisconception, practiceQuestions, recommendedAction } }`

### `GET /api/student/analytics` (Teacher Only)
- **Response:** `200 OK` `{ success: true, analytics: { totalStudents, quizzesCompleted, classAverageScore, timeSavedHoursThisWeek, topicPerformance, weakTopicAlerts, studentsAtRisk } }`

---

## 5. System Health & Diagnostics Endpoint

### `GET /api/health?diagnostics=true`
- **Response:** `200 OK`
```json
{
  "status": "online",
  "appName": "EduFlow AI Enterprise Backend",
  "databaseConnected": true,
  "primaryProvider": "IBM BOB (watsonx.ai Granite 13B & 20B)",
  "ibmBobConfigured": true,
  "geminiConfigured": false,
  "models": {
    "instruct": "ibm/granite-13b-instruct-v2",
    "chat": "ibm/granite-13b-chat-v2",
    "multilingual": "ibm/granite-20b-multilingual"
  },
  "telemetry": {
    "totalRequests": 12,
    "successfulRequests": 12,
    "ibmBobRequests": 10,
    "fallbackRequests": 2,
    "validationFailures": 0,
    "avgLatencyMs": 240
  }
}
```
