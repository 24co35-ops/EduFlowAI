# 3-Minute Live Demo & Judge Presentation Script — EduFlow AI

**Goal:** Demonstrate the complete closed-loop workflow of EduFlow AI in 3 minutes without fabricated logs, showing real teacher automation and student learning recovery powered by IBM BOB (watsonx.ai).

---

## Pre-Demo Preparation

1. Open `http://localhost:5173` (or live URL).
2. Open two browser tabs:
   - **Tab 1:** Teacher Portal (`teacher@eduflow.ai` / `teacher123`)
   - **Tab 2:** Student Portal (`student@eduflow.ai` / `student123`)

---

## 3-Minute Step-by-Step Script

### Minute 0:00 – 0:45: The Problem & Syllabus to Lesson Plan (Teacher)
- **Say:** *"Teachers spend 10+ hours a week converting syllabi into daily lesson plans. Let's see how IBM BOB automates this."*
- **Action (Tab 1):** Click **Quick Demo Account: Teacher**.
- **Action:** Navigate to **Lesson Planner (F1)**.
- **Action:** Paste a sample syllabus (e.g. *Class 10 Physics — Electricity & Ohm's Law*) or upload a PDF.
- **Action:** Click **Generate Lesson Plan with IBM BOB**.
- **Highlight:** Show the generated 5-day structured plan with daily durations, learning objectives, and classroom activities.
- **Action:** Click **Edit Plan**, change Day 1's duration to *"50 mins"*, click **Save Changes**. Show that edits persist.
- **Action:** Select language *Hindi (हिंदी)* and click **Translate** to demonstrate IBM Granite 20B Multilingual localization.

### Minute 0:45 – 1:30: Auto Quiz Builder & Publishing (Teacher)
- **Say:** *"Now, the teacher needs a formative assessment."*
- **Action:** Navigate to **Quiz Builder (F2)**.
- **Action:** Select Topic: *"Photosynthesis & Plant Energy"*, Difficulty: *Medium*, Question Count: *4*. Click **Auto-Generate Quiz with IBM BOB**.
- **Highlight:** Show the generated MCQs, True/False, and Short Answer questions with explanations.
- **Action:** Click the refresh icon on Question 2 to demonstrate **Per-Question AI Regeneration**.
- **Action:** Click **Publish to Students**.

### Minute 1:30 – 2:15: Student Practice, NLP Auto-Grading & Flashcards (Student)
- **Say:** *"Now let's switch to the student experience."*
- **Action (Tab 2):** Log in as **Student** (`student@eduflow.ai`).
- **Action:** Navigate to **Quizzes & Practice (F6)**.
- **Action:** Select the published quiz, answer the questions, type a short explanation for the subjective question, and click **Submit Quiz**.
- **Highlight:** Show instant NLP auto-grading where IBM Granite evaluates the short answer, gives constructive conceptual feedback, and updates the score.
- **Action:** Navigate to **Flashcards (F5)** and flip through the interactive 3D study deck.

### Minute 2:15 – 3:00: Diagnostic Analytics, "Who Needs Help?" & AI Remediation Loop (Closing the Loop)
- **Say:** *"EduFlow AI is not just a chatbot—it's a closed learning loop."*
- **Action (Tab 2):** Navigate to **My Progress (F8)**.
- **Highlight:** Show the transparent **Multi-Factor Topic Mastery Engine** (40% recent, 25% historical, 15% consistency, 10% difficulty, 10% trend).
- **Action:** Under Weak Area Focus, click **Remediate** on *Ohm Law*.
- **Highlight:** Show the **AI Remediation Modal**:
  1. 3-Minute fast breakdown
  2. Real-world water pipe analogy
  3. Misconception alert
  4. 3 interactive practice questions solved on the spot!
- **Action:** Click **Diagnostics** in the Navbar to show live IBM watsonx.ai connectivity, model IDs (`granite-13b-instruct-v2`, `granite-13b-chat-v2`, `granite-20b-multilingual`), and latency counters.
- **Conclude:** *"EduFlow AI turns raw curriculum into structured lessons, continuous assessments, and personalized learning recovery for every student."*
