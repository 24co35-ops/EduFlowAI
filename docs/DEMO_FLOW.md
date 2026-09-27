# End-to-End Hackathon Demo Script & Workflow — EduFlow AI

> **Demo Duration:** 4–5 Minutes  
> **Key Objective:** Prove the closed curriculum-to-learning loop powered by IBM BOB (watsonx.ai Granite 13B / 20B) with real-time observability.

---

## 1. Demo Narrative Arc
**"EduFlow AI transforms raw curriculum into an executable teaching and learning loop: create → teach → assess → understand → adapt."**

---

## 2. Step-by-Step Live Demo Execution

### Step 1: Teacher Ingestion & Curriculum Structuring (60s)
1. Log in as **Teacher** (`teacher@eduflow.ai` / `password123`).
2. Navigate to **Curriculum** tab.
3. Upload `Class_10_Science_Syllabus.pdf`.
4. Click **"Structure Curriculum"** → IBM Granite parses chapters, topics, and duration windows.
5. Click **"Generate 5-Day Lesson Plan"** → Observe structured daily breakdown with objectives and activities.
6. Manually edit Day 2 duration or objective (proves human-in-the-loop control).

### Step 2: Quiz Synthesis & In-Place Human Review (60s)
1. Navigate to **Quiz Builder**.
2. Select Topic: **"Photosynthesis & Plant Respiration"**, Difficulty: **Medium**, Count: **4**.
3. Click **"Generate with IBM BOB"** → Granite synthesizes 4 MCQ & Short Answer questions with source grounding.
4. Click **"Edit Question"** on Question #2 to customize an option.
5. Click **"Regenerate Question"** on Question #4 (proves granular single-question regeneration).
6. Click **"Publish Quiz to Class 10"**.

### Step 3: Student Assessment & Deterministic Auto-Grading (60s)
1. Log in as **Student** (`student@eduflow.ai` / `password123`).
2. Open assigned **"Photosynthesis & Plant Respiration"** Quiz.
3. Submit answers (mix of correct and purposeful weak responses on light-dependent reactions).
4. Review instant submission report:
   - MCQ scored **deterministically** (instant precision).
   - Short answer evaluated with **IBM Granite rubric feedback** highlighting missed concepts.

### Step 4: Closed-Loop Remediation & Dynamic Mastery (45s)
1. Navigate to **Student Dashboard / Progress**.
2. Topic Mastery displays **52% (Needs Review)** for Photosynthesis.
3. System generates an instant **"Remediation Plan"**:
   - 3-minute conceptual overview.
   - Real-world analogy (solar panel vs chloroplast).
   - Common misconception alert.
   - 3 micro practice questions.

### Step 5: Curriculum-Grounded Doubt Solver (45s)
1. Open **AI Doubt Solver**.
2. Ask in-scope question: *"Why do chlorophyll molecules require magnesium?"*
   - IBM Granite responds with grounded explanation and citation: `[Source: Chapter 6, Page 14]`.
3. Ask out-of-scope question: *"Who was Napoleon Bonaparte?"*
   - System politely detects out-of-syllabus query and redirects to science curriculum.

### Step 6: Observability Drawer & Teacher Analytics (30s)
1. Click **"IBM AI Diagnostics"** badge at bottom right.
2. Show live telemetry: Primary Provider (`IBM BOB watsonx.ai`), active models (`granite-13b-instruct-v2`, `granite-13b-chat-v2`, `granite-20b-multilingual`), latency distribution, and zero-error rate.
3. Switch to Teacher **Class Analytics** → view class weak-topic heatmap and recommended review topics.
