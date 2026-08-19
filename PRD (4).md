# Product Requirements Document (PRD)
## EduFlow AI — Intelligent Course Content Automation Tool

**Version:** 1.0  
**Date:** August 2026  
**Author:** EduFlow Team  
**Hackathon:** IBM Hackathon (BOB-powered)

---

## 1. Overview

### 1.1 Product Summary
EduFlow AI is an intelligent education automation platform powered by IBM BOB (watsonx.ai). It eliminates repetitive content-creation work for teachers and delivers personalized, adaptive learning experiences for students — all through a unified full-stack web application.

### 1.2 Problem Statement
- Teachers spend 60%+ of their time creating lesson plans, quizzes, and assignments manually.
- Students lack personalized feedback and adaptive content pacing.
- Schools and coaching centres struggle to scale quality education without proportionally scaling staff.

### 1.3 Vision
Automate the end-to-end lifecycle of educational content creation, delivery, and assessment using AI — so educators focus on teaching, not paperwork.

---

## 2. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Reduce teacher content-prep time | < 20 mins/week per subject |
| Increase student engagement | Quiz completion rate > 80% |
| Multilingual content delivery | Support 5+ Indian languages |
| Auto-grading accuracy | > 90% match with manual grading |

---

## 3. Target Users

### 3.1 Primary Users
- **Teachers / Educators** — K-12, coaching institutes, online educators
- **Students** — Classes 6–12, competitive exam aspirants

### 3.2 Secondary Users
- **School Administrators** — Progress dashboards, reports
- **Institution Owners** — Analytics and performance trends

---

## 4. User Stories

### Teacher
- As a teacher, I want to upload a syllabus PDF so that BOB can auto-generate a weekly lesson plan.
- As a teacher, I want to auto-generate quizzes with varying difficulty so I can save time on assessment creation.
- As a teacher, I want to receive auto-generated weekly performance reports on my students.

### Student
- As a student, I want to paste a chapter and get flashcards and MCQs instantly.
- As a student, I want to ask doubts in plain language and get curriculum-aligned answers.
- As a student, I want to see my progress and receive content adapted to my weak areas.

---

## 5. Features & Requirements

### 5.1 Core Features

#### F1 — Syllabus to Lesson Plan (Teacher)
- Upload PDF/text syllabus
- BOB parses and generates structured lesson plans (topic, duration, activities)
- Export as PDF or share via link

#### F2 — Auto Quiz Generator (Teacher)
- Input: topic or chapter
- Output: MCQs, short answers, true/false — with difficulty levels (Easy / Medium / Hard)
- Edit before publishing

#### F3 — Multilingual Content (Teacher)
- Translate generated content into Hindi, Marathi, Tamil, Telugu, Kannada
- Powered by BOB's language capabilities

#### F4 — Student Doubt Solver (Student)
- Chat interface powered by BOB
- Curriculum-aware: answers stay in scope of uploaded syllabus

#### F5 — Flashcard & Summary Generator (Student)
- Paste chapter text → instant flashcards + bullet-point summary
- Save to personal deck

#### F6 — Adaptive Quiz Engine (Student)
- BOB evaluates quiz performance
- Next quiz difficulty auto-adjusts based on scores

#### F7 — Auto Grading (Teacher + Student)
- Short-answer grading using BOB's NLP
- Score + feedback returned to student instantly

#### F8 — Analytics Dashboard
- Teacher: per-student and class-wide performance
- Student: score history, weak topics, streak

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Response latency (BOB API) | < 3 seconds |
| Uptime | 99.5% |
| Concurrent users | 500+ |
| Data security | Encrypted at rest and in transit |
| Accessibility | WCAG 2.1 AA compliant |

---

## 7. Out of Scope (v1.0)
- Live video classes
- Parent portal
- Mobile native apps
- Payment / subscription billing

---

## 8. Timeline

| Phase | Duration | Deliverable |
|---|---|---|
| Phase 1 — Core MVP | Week 1–2 | Lesson plan + Quiz generator |
| Phase 2 — Student Features | Week 3 | Doubt solver + Flashcards |
| Phase 3 — Analytics | Week 4 | Dashboards + Auto-grading |
| Phase 4 — Polish & Demo | Week 5 | UI polish, demo video, deployment |
