# Security & Threat Model — EduFlow AI

## 1. Authentication & Session Management

- **Password Hashing:** Passwords are encrypted using `bcryptjs` with 10 salt rounds before persistence.
- **Complexity Enforced:** Minimum 8 characters enforced on both registration and password reset.
- **JWT Authorization:** Tokens signed with HMAC-SHA256 containing user ID, role, email, and name with 7-day expiration.
- **Secure Password Reset:** Cryptographically secure 32-byte tokens generated via `crypto.randomBytes(32)` with 1-hour expiration and user-enumeration mitigation (endpoint always returns generic success message).

---

## 2. Role-Based Access Control (RBAC) & IDOR Defense

All API endpoints are guarded by `protect` and `requireRole()` middleware (`server/middleware/auth.js`):

| Endpoint Route | Method | Required Role | Authorization & IDOR Check |
|---|---|---|---|
| `/api/lessons/generate` | POST | `teacher` | Rate-limited; authenticated teacher ID attached. |
| `/api/lessons/:id` | GET | `teacher` / `student` | Verifies ownership if requester is a teacher. |
| `/api/lessons/:id` | PUT | `teacher` | Verified: `String(lesson.teacherId) === String(req.user.id)`. |
| `/api/lessons/:id` | DELETE | `teacher` | Verified: `String(lesson.teacherId) === String(req.user.id)`. |
| `/api/quizzes/generate` | POST | `teacher` | Rate-limited; authenticated teacher ID attached. |
| `/api/quizzes/:id` | PUT | `teacher` | Verified: `String(quiz.teacherId) === String(req.user.id)`. |
| `/api/quizzes/:id` | DELETE | `teacher` | Verified: `String(quiz.teacherId) === String(req.user.id)`. |
| `/api/quizzes/grade` | POST | `student` | Student submits attempt; student ID attached. |
| `/api/quizzes/attempts` | GET | `teacher` / `student` | Student receives own attempts; Teacher receives only attempts for quizzes they authored. |
| `/api/student/progress` | GET | `student` | Scoped strictly to `req.user.id`. Teachers receive 403 Forbidden. |
| `/api/student/analytics`| GET | `teacher` | Aggregates class data. Students receive 403 Forbidden. |
| `/api/student/flashcards`| GET | `student` | Scoped strictly to `req.user.id` (zero cross-student leakage). |

---

## 3. Data Protection & File Security

- **PDF Ingestion:** `multer.memoryStorage()` buffers files up to 10MB in memory; file filter verifies `application/pdf` MIME and `.pdf` extension. Temporary disk storage is avoided.
- **NoSQL Injection Prevention:** `express-mongo-sanitize` strips `$` and `.` characters from incoming request bodies and parameters.
- **Security Headers:** `helmet` sets X-Content-Type-Options, Referrer-Policy, and X-Frame-Options.
- **Rate Limiting:** Auth endpoints throttled to 30 requests / 15 minutes; AI generation throttled to 20 requests / 15 minutes per IP.
