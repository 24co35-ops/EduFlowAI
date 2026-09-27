# Technology Stack Specification — EduFlow AI

## 1. Frontend Technology Stack

| Component | Technology | Version | Purpose |
|---|---|---|---|
| **Core Framework** | React | 18.2.0 | Reactive component-driven user interface |
| **Bundler & Tooling** | Vite | 5.4.21 | Ultra-fast HMR and optimized production build bundling |
| **Routing** | React Router DOM | 6.22.3 | Client-side declarative routing and role-based route guards |
| **Styling** | Tailwind CSS | 3.4.1 | Utility-first responsive design, dark slate theme, custom glassmorphism |
| **Icons** | Lucide React | 0.368.0 | Clean, consistent, lightweight SVG icon system |
| **HTTP Client** | Axios | 1.6.8 | REST API client with request/response interceptors |

---

## 2. Backend Technology Stack

| Component | Technology | Version | Purpose |
|---|---|---|---|
| **Runtime** | Node.js | >=18.0.0 | High-performance asynchronous JavaScript runtime |
| **Web Framework** | Express | 4.19.2 | RESTful API server and routing middleware |
| **Security Headers** | Helmet | 8.3.0 | HTTP security headers |
| **NoSQL Sanitization** | express-mongo-sanitize | 2.2.0 | Strips `$` and `.` to prevent NoSQL injection |
| **Rate Limiting** | express-rate-limit | 8.7.0 | IP-based request throttling on auth and AI endpoints |
| **Authentication** | jsonwebtoken & bcryptjs | 9.0.2 / 2.4.3 | Signed JWT token generation and 10-round password hashing |
| **File Handling** | Multer | 1.4.5-lts.1 | In-memory multipart buffer processing for syllabus PDFs |
| **PDF Extraction** | pdf-parse | 1.1.1 | Server-side PDF text extraction from buffer |
| **Database ODM** | Mongoose | 8.3.1 | MongoDB object modeling and schema validation |

---

## 3. AI & Cloud Infrastructure

| Service | Provider | Models / APIs | Usage |
|---|---|---|---|
| **Primary AI Engine** | IBM Cloud watsonx.ai | `ibm/granite-13b-instruct-v2` | Lesson planning, quiz synthesis, flashcards, auto-grading, remediation |
| **Conversational Tutor**| IBM Cloud watsonx.ai | `ibm/granite-13b-chat-v2` | Multi-turn curriculum doubt solver |
| **Multilingual AI** | IBM Cloud watsonx.ai | `ibm/granite-20b-multilingual` | Translation into Hindi, Marathi, Tamil, Telugu, Kannada |
| **Fallback AI Engine** | Google Cloud / Local | `gemini-1.5-flash` / Smart Engine | Resilient secondary generation for demo & offline reliability |
| **Database** | MongoDB Atlas / Local | MongoDB 6.0+ | Document storage for users, lessons, quizzes, attempts, decks |
| **Hosting & CDN** | Vercel | Node Serverless Runtime | Global edge CDN and serverless API execution |
