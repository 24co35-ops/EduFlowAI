# Pages — Component Dependency Trees

## / — Landing Page (unauthenticated)
Entry: `client/src/pages/MakerLandingPage.jsx`
Dependencies:
- react-router-dom (Link)
- No shared components (self-contained stationery design)

## / — Teacher Dashboard (authenticated, role=teacher)
Entry: `client/src/pages/TeacherDashboard.jsx`
Dependencies:
- client/src/components/Navbar.jsx
  - client/src/components/DiagnosticPanel.jsx
- client/src/components/Sidebar.jsx
- client/src/components/AIEvidenceBadge.jsx
- client/src/services/api.js
- lucide-react icons

## / — Student Dashboard (authenticated, role=student)
Entry: `client/src/pages/StudentDashboard.jsx`
Dependencies:
- client/src/components/Navbar.jsx
  - client/src/components/DiagnosticPanel.jsx
- client/src/components/Sidebar.jsx
- client/src/components/AIEvidenceBadge.jsx
- client/src/components/RemediationModal.jsx
- client/src/services/api.js
- react-chartjs-2, chart.js
- lucide-react icons

## /lesson-planner — Lesson Planner Page
Entry: `client/src/pages/LessonPlannerPage.jsx`
Dependencies:
- client/src/components/AIEvidenceBadge.jsx
- client/src/services/api.js
- lucide-react icons

## /quiz-builder — Quiz Builder Page
Entry: `client/src/pages/QuizBuilderPage.jsx`
Dependencies:
- client/src/components/AIEvidenceBadge.jsx
- client/src/services/api.js
- lucide-react icons

## /analytics — Class Analytics Page
Entry: `client/src/pages/ClassAnalyticsPage.jsx`
Dependencies:
- client/src/components/AIEvidenceBadge.jsx
- client/src/services/api.js
- react-chartjs-2, chart.js
- lucide-react icons

## /action-center — Action Center Page
Entry: `client/src/pages/ActionCenterPage.jsx`
Dependencies:
- client/src/components/AIEvidenceBadge.jsx
- client/src/services/api.js
- lucide-react icons

## /curriculum-twin — Curriculum Twin Page
Entry: `client/src/pages/CurriculumTwinPage.jsx`
Dependencies:
- client/src/components/AIEvidenceBadge.jsx
- client/src/services/api.js
- lucide-react icons

## /mastery-check — Mastery Check Page
Entry: `client/src/pages/MasteryCheckPage.jsx`
Dependencies:
- client/src/components/AIEvidenceBadge.jsx
- client/src/services/api.js
- lucide-react icons

## /workflow-studio — Workflow Studio Page
Entry: `client/src/pages/WorkflowStudioPage.jsx`
Dependencies:
- @xyflow/react (ReactFlow, Background, Controls, MiniMap)
- client/src/workflow/nodes/AgentNode.jsx
- client/src/workflow/edges/DataFlowEdge.jsx
- client/src/workflow/components/NodePalette.jsx
- client/src/workflow/components/CanvasToolbar.jsx
- client/src/workflow/components/InspectorDrawer.jsx
- client/src/workflow/engine/agentDefinitions.js
- client/src/workflow/engine/templates.js
- client/src/workflow/engine/workflowRunner.js
- lucide-react icons

## /doubt-solver — AI Doubt Solver Page
Entry: `client/src/pages/DoubtSolverPage.jsx`
Dependencies:
- client/src/components/AIEvidenceBadge.jsx
- client/src/services/api.js
- lucide-react icons

## /flashcards — Flashcards Page
Entry: `client/src/pages/FlashcardsPage.jsx`
Dependencies:
- client/src/components/AIEvidenceBadge.jsx
- client/src/services/api.js
- lucide-react icons
