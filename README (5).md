# 🎓 EduFlow AI

> **Intelligent Course Content Automation powered by IBM BOB (watsonx.ai)**  
> Built for the IBM Hackathon 2026

[![IBM watsonx](https://img.shields.io/badge/IBM-watsonx.ai-blue?logo=ibm)](https://www.ibm.com/watsonx)
[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-green?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://mongodb.com)

---

## 🚀 What is EduFlow AI?

EduFlow AI eliminates the repetitive grind of education content creation. Teachers upload a syllabus and instantly get AI-generated lesson plans, quizzes, and multilingual materials. Students get personalized doubt solving, adaptive quizzes, and instant flashcards — all powered by IBM BOB (watsonx.ai).

---

## ✨ Features

### 👩‍🏫 For Teachers
- 📄 **Syllabus → Lesson Plan** — Upload a PDF, get a structured week-by-week plan
- ❓ **Auto Quiz Generator** — Generate MCQs, short answers, true/false with difficulty levels
- 🌐 **Multilingual Content** — Translate materials to Hindi, Marathi, Tamil, Telugu, Kannada
- 📊 **Class Analytics** — Performance dashboards, weak-topic heatmaps, weekly reports
- ✅ **Auto Grading** — BOB grades short answers with feedback instantly

### 🧑‍🎓 For Students
- 💬 **AI Doubt Solver** — Curriculum-aware chat powered by BOB
- 🃏 **Flashcard Generator** — Paste any chapter → instant flashcards + summary
- 🎯 **Adaptive Quizzes** — Difficulty adjusts based on your performance
- 📈 **Progress Tracker** — Score history, streaks, and weak area identification

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, Chart.js |
| Backend | Node.js 20, Express.js, Socket.io |
| AI Engine | IBM BOB (watsonx.ai — Granite models) |
| Database | MongoDB Atlas |
| File Storage | IBM Cloud Object Storage |
| Auth | JWT + bcrypt |
| Deployment | IBM Cloud Code Engine |

---

## 📁 Project Structure

```
eduflow-ai/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── services/
│   └── public/
├── server/                  # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   └── bob.service.js   # IBM BOB integration
│   └── middleware/
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- IBM Cloud account with watsonx.ai access
- IBM Cloud Object Storage bucket

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/eduflow-ai.git
cd eduflow-ai
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
```

Edit `.env`:
```env
# IBM BOB / watsonx.ai
WATSONX_URL=https://us-south.ml.cloud.ibm.com
IBM_API_KEY=your_ibm_api_key
WATSONX_PROJECT_ID=your_project_id

# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/eduflow

# Auth
JWT_SECRET=your_super_secret_key

# IBM Cloud Object Storage
IBM_COS_API_KEY=your_cos_api_key
IBM_COS_BUCKET=eduflow-uploads
IBM_COS_ENDPOINT=https://s3.us-south.cloud-object-storage.appdomain.cloud
```

### 3. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 4. Run the Application

```bash
# Start backend (from /server)
npm run dev

# Start frontend (from /client)
npm start
```

App runs at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

### 5. Run with Docker (Optional)
```bash
docker-compose up --build
```

---

## 🔌 IBM BOB Integration

All AI features route through `server/services/bob.service.js`:

```javascript
const { WatsonXAI } = require('@ibm-cloud/watsonx-ai');
const { IamAuthenticator } = require('ibm-watson/auth');

const client = new WatsonXAI({
  version: '2024-05-31',
  serviceUrl: process.env.WATSONX_URL,
  authenticator: new IamAuthenticator({ apikey: process.env.IBM_API_KEY })
});

async function generateContent(prompt) {
  const response = await client.generateText({
    modelId: 'ibm/granite-13b-instruct-v2',
    projectId: process.env.WATSONX_PROJECT_ID,
    input: prompt,
    parameters: { max_new_tokens: 800, temperature: 0.7 }
  });
  return response.result.results[0].generated_text;
}
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login, get JWT |
| POST | `/api/lessons/generate` | Generate lesson plan from syllabus PDF |
| GET | `/api/lessons` | Get all lessons |
| POST | `/api/quizzes/generate` | Generate quiz for a topic |
| POST | `/api/quizzes/grade` | Auto-grade student attempt |
| POST | `/api/flashcards/generate` | Generate flashcards from text |
| GET | `/api/progress` | Get student progress summary |
| WS | `/chat` | Real-time doubt solver |

---

## 🎯 Demo Flow

1. **Teacher** registers and uploads a Class 10 Science syllabus PDF
2. BOB generates a complete 5-day lesson plan in seconds
3. Teacher generates a quiz for "Photosynthesis" at Medium difficulty
4. **Student** logs in, takes the quiz, gets instant AI feedback + score
5. Student asks a doubt in the chat — BOB answers within the syllabus scope
6. Teacher views the analytics dashboard — class performance at a glance

---

## 🏆 Hackathon Highlights

- ✅ IBM BOB (watsonx.ai) is the **core AI engine** — not a bolt-on
- ✅ Solves a **real, measurable problem** in education
- ✅ Full-stack, deployable on **IBM Cloud** end-to-end
- ✅ Multilingual support for **Bharat-first** accessibility
- ✅ Live demo-ready in under 5 minutes

---

## 👥 Team

| Name | Role |
|---|---|
| — | Full Stack Developer |
| — | AI/BOB Integration |
| — | UI/UX Design |

---

## 📄 License

MIT License © 2026 EduFlow Team

---

> Built with ❤️ at IBM Hackathon 2026 using IBM BOB (watsonx.ai)
