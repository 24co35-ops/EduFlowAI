# UI/UX & Design System — EduFlow AI

## 1. Visual Hierarchy & Aesthetic Philosophy

EduFlow AI avoids generic "AI template" aesthetics (no excessive glowing orbs or meaningless floating particles). Instead, it implements a restrained, high-density, professional Dark Theme engineered for institutional education:

- **Primary Background:** Slate-950 (`#020617`) with subtle Slate-900 glass panels.
- **Accent Palettes:**
  - **Indigo/Violet:** Teacher workflows, lesson planning, and IBM Granite branding.
  - **Emerald/Teal:** Student progress, high accuracy, and completed states.
  - **Amber/Orange:** Streak tracking, medium difficulty, and active attention alerts.
  - **Rose/Coral:** Low accuracy warnings and misconception alerts.
- **Typography:** Outfit (Google Fonts) for structured headers; clean system sans-serif for high legibility on small viewports.

---

## 2. Responsive Breakpoints & Viewport Testing

All application layouts are tested across standard viewport widths:
- **Mobile (320px – 430px):** Single-column layout, bottom-sheet style cards, collapsible inputs, horizontal chip carousels.
- **Tablet (768px):** Split dashboard cards, compact sidebar.
- **Desktop (1024px – 1440px+):** 12-column grid layout with simultaneous input form and live output preview panels.

---

## 3. Interaction Design & Micro-States

1. **Lesson Planner:** Split screen with live syllabus drag-and-drop, instant day-by-day card generation, and in-place day editing.
2. **Flashcards:** 3D card-flip interaction with keyboard navigation (`Previous`, `Next`, `Flip`), summary highlights, and revision progress.
3. **Doubt Tutor:** Multi-turn chat with real-time thinking pulses and one-click action chips (*"Simplify Concept"*, *"Give Real-World Example"*, *"Quiz Me on This"*).
4. **Remediation Loop:** Modal container with 3-minute explanation, real-world analogy, misconception alert, and interactive 3-question knowledge check.
5. **Observability Drawer:** Live telemetry modal displaying IBM watsonx.ai connectivity, model IDs, latency counters, and database state.
