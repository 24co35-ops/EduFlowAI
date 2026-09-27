# Rule 01: Project Purpose & Core Domain

## 1. System Mission
EduFlow AI is an Intelligent Course Content Automation platform powered by IBM BOB (watsonx.ai) and IBM Granite foundational models. It bridges syllabus ingestion to an adaptive student learning loop:
**Upload Syllabus → Structure Curriculum → Generate Lesson Plans & Quizzes → Human-in-the-Loop Review → Student Assessment & Auto-Grading → Mastery Updates → Targeted Remediation → Curriculum-Grounded Doubt Solver**.

## 2. Source of Truth & Philosophy
- EduFlow AI is **not** an arbitrary collection of detached AI buttons; it is a **closed-loop educational workflow**.
- Teachers retain 100% human-in-the-loop agency over AI-generated drafts (in-place question editing, difficulty switching, question regeneration).
- Assessment is split: objective questions (MCQ/True-False) are scored **deterministically**; subjective/short-answers are evaluated with **IBM Granite-assisted rubric grading**.
- Student doubts are grounded strictly in syllabus context (RAG) with visible chunk citations (`[Source: Chapter X, Page Y]`).
