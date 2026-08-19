# Tech Stack
## EduFlow AI — Intelligent Course Content Automation Tool

**Version:** 1.0  
**Hackathon:** IBM Hackathon (BOB-powered)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                     CLIENT LAYER                     │
│              React.js + Tailwind CSS                 │
└───────────────────────┬──────────────────────────────┘
                        │ REST / WebSocket
┌───────────────────────▼──────────────────────────────┐
│                    BACKEND LAYER                     │
│              Node.js + Express.js                    │
│         (Auth · File Processing · API Gateway)       │
└──────┬────────────────┬────────────────┬─────────────┘
       │                │                │
┌──────▼──────┐  ┌──────▼──────┐  ┌─────▼───────┐
│  MongoDB    │  │  IBM BOB    │  │  IBM Cloud  │
│  Atlas      │  │ watsonx.ai  │  │  Storage    │
│ (User data, │  │ (AI Engine) │  │ (PDF/Files) │
│  Quiz data) │  └─────────────┘  └─────────────┘
└─────────────┘
```

---

## 2. Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React.js** | 18.x | UI framework — component-based SPA |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **React Router** | 6.x | Client-side routing |
| **Axios** | 1.x | HTTP client for API calls |
| **React Query** | 5.x | Server state management + caching |
| **Chart.js** | 4.x | Analytics dashboards |
| **React Markdown** | 9.x | Render BOB-generated markdown content |
| **Socket.io-client** | 4.x | Real-time doubt chat |

---

## 3. Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 20 LTS | Runtime |
| **Express.js** | 4.x | REST API framework |
| **Socket.io** | 4.x | WebSocket server for live chat |
| **Multer** | 1.x | File upload handling (PDFs, docs) |
| **pdf-parse** | 1.x | Extract text from uploaded PDFs |
| **JWT** | 9.x | Stateless auth tokens |
| **bcrypt** | 5.x | Password hashing |
| **Mongoose** | 8.x | MongoDB ODM |
| **dotenv** | 16.x | Environment config |

---

## 4. AI Engine — IBM BOB (watsonx.ai)

| Feature | BOB Model / API |
|---|---|
| Lesson plan generation | `ibm/granite-13b-instruct-v2` |
| Quiz & flashcard generation | `ibm/granite-13b-instruct-v2` |
| Doubt solving (chat) | `ibm/granite-13b-chat-v2` |
| Auto-grading (NLP) | `ibm/granite-13b-instruct-v2` |
| Multilingual translation | `ibm/granite-20b-multilingual` |
| Adaptive scoring | Custom prompt chain |

### BOB Integration Pattern
```javascript
// Example: Lesson Plan Generation
const watsonx = require('@ibm-cloud/watsonx-ai');

const client = new watsonx.WatsonXAI({
  version: '2024-05-31',
  serviceUrl: process.env.WATSONX_URL,
  authenticator: new IamAuthenticator({ apikey: process.env.IBM_API_KEY })
});

const response = await client.generateText({
  modelId: 'ibm/granite-13b-instruct-v2',
  input: `Generate a 5-day lesson plan for: ${syllabus}`,
  parameters: { max_new_tokens: 800, temperature: 0.7 }
});
```

---

## 5. Database — MongoDB Atlas

### Collections

| Collection | Purpose |
|---|---|
| `users` | Teacher & student accounts |
| `lessons` | Generated lesson plans |
| `quizzes` | Quiz questions + difficulty metadata |
| `attempts` | Student quiz attempts + scores |
| `flashcards` | Student flashcard decks |
| `chats` | Doubt-solver conversation history |
| `reports` | Weekly performance snapshots |

---

## 6. IBM Cloud Services

| Service | Purpose |
|---|---|
| **IBM watsonx.ai** | Core AI engine (BOB) |
| **IBM Cloud Object Storage** | Store uploaded PDFs, documents |
| **IBM App ID** | Authentication + OAuth 2.0 |
| **IBM Cloud Foundry / Code Engine** | Backend deployment |
| **IBM Cloud Databases (MongoDB)** | Managed DB (optional, can use Atlas) |

---

## 7. DevOps & Tooling

| Tool | Purpose |
|---|---|
| **GitHub** | Version control |
| **GitHub Actions** | CI/CD pipeline |
| **Docker** | Containerisation |
| **IBM Cloud CLI** | Deploy to IBM Cloud |
| **Postman** | API testing |
| **Jest** | Unit & integration testing |

---

## 8. Environment Variables

```env
# IBM BOB / watsonx
WATSONX_URL=https://us-south.ml.cloud.ibm.com
IBM_API_KEY=your_ibm_api_key
WATSONX_PROJECT_ID=your_project_id

# MongoDB
MONGO_URI=mongodb+srv://...

# Auth
JWT_SECRET=your_jwt_secret

# IBM Cloud Storage
IBM_COS_API_KEY=your_cos_key
IBM_COS_BUCKET=eduflow-uploads
```

---

## 9. Folder Structure

```
eduflow-ai/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # Axios API calls
│   │   └── utils/
│   └── public/
├── server/                  # Express backend
│   ├── controllers/         # Route handlers
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── services/
│   │   └── bob.service.js   # BOB / watsonx integration
│   ├── middleware/          # Auth, error handling
│   └── utils/
├── docker-compose.yml
├── .env.example
└── README.md
```
