# Routes — Page/Route Mapping

Framework: React 18 + Vite (config-based routing via react-router-dom v6)
Router config: `client/src/App.jsx`

## Public Routes (no auth)
| URL Path | Component | Layout |
|---|---|---|
| `/` (unauthenticated) | `MakerLandingPage` | Full-bleed (no Navbar/Sidebar) |
| `/landing` | `MakerLandingPage` | Full-bleed (no Navbar/Sidebar) |
| `/login` | `LoginPage` (from AuthPages) | Navbar + main (no Sidebar) |
| `/register` | `RegisterPage` (from AuthPages) | Navbar + main (no Sidebar) |
| `/forgot-password` | `ForgotPasswordPage` | Navbar + main |
| `/reset-password` | `ResetPasswordPage` | Navbar + main |
| `/reset-password/:token` | `ResetPasswordPage` | Navbar + main |

## Authenticated Routes — Teacher (role: 'teacher')
| URL Path | Component | Layout |
|---|---|---|
| `/` | `TeacherDashboard` | Navbar + Sidebar + main |
| `/lesson-planner` | `LessonPlannerPage` | Navbar + Sidebar + main |
| `/quiz-builder` | `QuizBuilderPage` | Navbar + Sidebar + main |
| `/analytics` | `ClassAnalyticsPage` | Navbar + Sidebar + main |
| `/curriculum-twin` | `CurriculumTwinPage` | Navbar + Sidebar + main |
| `/action-center` | `ActionCenterPage` | Navbar + Sidebar + main |
| `/workflow-studio` | `WorkflowStudioPage` | Navbar + full-height (no Sidebar) |

## Authenticated Routes — Student (role: 'student')
| URL Path | Component | Layout |
|---|---|---|
| `/` | `StudentDashboard` | Navbar + Sidebar + main |
| `/doubt-solver` | `DoubtSolverPage` | Navbar + Sidebar + main |
| `/flashcards` | `FlashcardsPage` | Navbar + Sidebar + main |
| `/quizzes` | `QuizAttemptPage` | Navbar + Sidebar + main |
| `/progress` | `StudentProgressPage` | Navbar + Sidebar + main |
| `/mastery-check` | `MasteryCheckPage` | Navbar + Sidebar + main |
| `/workflow-studio` | `WorkflowStudioPage` | Navbar + full-height (no Sidebar) |

## Route Guards
- `ProtectedRoute` component checks `user` object and `allowedRoles` array
- Unauthenticated → redirects to `/login`
- Wrong role → redirects to `/`
- `/*` catch-all → redirects to `/`

## Key Page Summaries
- **MakerLandingPage**: Warm stationery-aesthetic public landing with travelling product instrument, self-drawing SVG, spread wordmark, Newsreader/Courier Prime typography
- **TeacherDashboard**: Stat cards (courses, students, quizzes, avg accuracy), recent quizzes table, quick actions grid, AI evidence badge
- **StudentDashboard**: Topic mastery radar chart, quiz history, weak topics, remediation launcher, progress stats
- **ActionCenterPage**: High-priority class learning gaps, affected student counts, misconception detection, 1-click remediation dispatch
- **CurriculumTwinPage**: Interactive concept graph with prerequisite chains, competency listings, source citations, aggregated mastery levels
- **WorkflowStudioPage**: Visual node-based AI pipeline editor using @xyflow/react (React Flow), with agent nodes, data flow edges, templates, canvas toolbar
- **ClassAnalyticsPage**: Accuracy heatmaps, topic failure rates, student risk identification, chart.js visualizations
- **MasteryCheckPage**: Closed-loop post-intervention diagnostic with before/after delta scoring and evidence logging
