# Layouts — Shared Layout Components

## Navbar (Top Navigation)
- Source: `client/src/components/Navbar.jsx`
- Description: Sticky top nav with glassmorphism, gradient logo, role-based nav links (teacher/student), mobile hamburger menu, AI diagnostics toggle, and user profile/logout
- Renders: Logo + wordmark, desktop nav links with tags, AI diagnostics button, user avatar + logout, mobile slide-out menu

```jsx
// Key structure (abbreviated for context):
// - Sticky top-0 z-40 glass-card with slate-950/80 bg and backdrop-blur-md
// - Logo: 40x40px gradient (blue→indigo→purple) rounded-xl with Sparkles icon
// - Wordmark: "EduFlow AI" in font-outfit, "AI" uses gradient-text class
// - Role-based nav arrays:
//   Teacher: Dashboard, Workflow Studio, Action Center, Curriculum Twin, Lesson Planner, Quiz Builder, Class Analytics
//   Student: Dashboard, Workflow Studio, Mastery Check, AI Doubt Solver, Flashcards, Quizzes, My Progress
// - NavLinks: text-xs font-semibold with active state bg-indigo-600 text-white shadow-lg
// - Tags: px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/20 text-indigo-300 border-indigo-500/30
// - AI Diagnostics button: Activity icon, toggles DiagnosticPanel modal
// - User section: avatar initial in indigo gradient circle, name, role badge, logout button
// - Mobile: slide-out menu with full nav + profile section
```

## Sidebar (Left Navigation)
- Source: `client/src/components/Sidebar.jsx`
- Description: Fixed-width (w-64) left sidebar with profile widget, role-based nav links, and IBM watsonx banner; hidden on mobile (hidden md:block)

```jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileCheck2, BarChart3, MessageSquareCode, Layers, LineChart, Sparkles, Zap, GraduationCap, Network, Crosshair, Target } from 'lucide-react';

export default function Sidebar({ user }) {
  const isTeacher = user?.role === 'teacher';
  const displayName = user?.name || 'Educator';

  // Same nav arrays as Navbar (teacher/student role-based)
  // Renders:
  // - aside w-64 flex-shrink-0 hidden md:block
  // - sticky top-20 glass-card rounded-2xl p-4 border-slate-800
  // - Profile widget: GraduationCap icon, name, role + grade
  // - NavLinks: rounded-xl, active = bg-indigo-600 text-white shadow-lg shadow-indigo-600/25
  // - IBM watsonx banner: gradient bg from-blue-950/40 via-indigo-950/30 to-purple-950/40
}
```

## App Shell (Root Layout)
- Source: `client/src/App.jsx`
- Description: BrowserRouter wrapper with auth state (localStorage), role-based routing, ProtectedRoute guard component
- Structure:
  - Full-bleed MakerLandingPage for `/landing` or unauthenticated `/`
  - Workflow Studio gets full-height layout (no sidebar)
  - All other authenticated routes: Navbar + Sidebar + main content + footer
  - Footer: `border-t border-slate-900 py-6 text-center text-xs text-slate-500 glass-card`

## Footer (inline in App.jsx)
- Not a standalone component; rendered inline as:
```jsx
<footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 glass-card">
  <p>EduFlow AI © 2026 — IBM Hackathon Project powered by IBM watsonx.ai (Granite 13B & 20B)</p>
</footer>
```
