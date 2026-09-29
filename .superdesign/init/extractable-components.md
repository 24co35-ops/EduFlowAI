# Extractable Components — Reusable DraftComponent Candidates

## Layout Components (appear on most pages)

### Navbar
- Source: `client/src/components/Navbar.jsx`
- Category: layout
- Description: Sticky glassmorphism top nav with gradient logo, role-based links, diagnostics toggle, mobile menu
- Extractable props: `user` (object), `setUser` (function)
- Hardcoded: Logo SVG gradient, "EduFlow AI" text, nav item arrays, all Tailwind classes

### Sidebar
- Source: `client/src/components/Sidebar.jsx`
- Category: layout
- Description: Fixed-width left sidebar with profile widget, role-based navigation, IBM watsonx banner
- Extractable props: `user` (object with name, role, grade)
- Hardcoded: Nav item arrays, GraduationCap icon, IBM banner text, all Tailwind classes

### Footer
- Source: inline in `client/src/App.jsx` (line ~194)
- Category: layout
- Description: Simple centered footer with copyright and IBM attribution
- Extractable props: none
- Hardcoded: "EduFlow AI © 2026" text, glass-card class

## Basic Components (used across pages)

### AIEvidenceBadge
- Source: `client/src/components/AIEvidenceBadge.jsx`
- Category: basic
- Description: Truthful AI telemetry badge showing provider, model name, latency, verification status
- Extractable props: `metadata` (object), `compact` (boolean, default: false)
- Hardcoded: Provider display logic, icon selection, Tailwind gradient classes

### DiagnosticPanel
- Source: `client/src/components/DiagnosticPanel.jsx`
- Category: basic
- Description: Full-screen overlay modal with real-time AI telemetry metrics, request history, model status
- Extractable props: `onClose` (function)
- Hardcoded: API endpoint `/api/health`, metric labels, chart layout

### RemediationModal
- Source: `client/src/components/RemediationModal.jsx`
- Category: basic
- Description: Modal for AI-generated remediation content with explanation, analogy, misconception alert, practice questions
- Extractable props: `topic` (string), `score` (number), `weakSubtopics` (array), `onClose` (function)
- Hardcoded: API endpoint `/api/student/remediation`, section headings, Tailwind classes

## Workflow Components (Workflow Studio only)

### AgentNode
- Source: `client/src/workflow/nodes/AgentNode.jsx`
- Category: basic
- Description: Custom React Flow node representing an AI agent with status indicators, input/output handles
- Extractable props: `data` (object with label, type, status, config)
- Hardcoded: Node type color mapping, status pulse animations, handle positions

### NodePalette
- Source: `client/src/workflow/components/NodePalette.jsx`
- Category: basic
- Description: Draggable sidebar palette of available agent node types for the workflow canvas
- Extractable props: none (reads from agentDefinitions)
- Hardcoded: Agent type categories, drag-and-drop handlers

### CanvasToolbar
- Source: `client/src/workflow/components/CanvasToolbar.jsx`
- Category: basic
- Description: Floating toolbar with canvas controls (zoom, fit, clear, export, template picker)
- Extractable props: canvas action callbacks
- Hardcoded: Button icons, toolbar layout

### InspectorDrawer
- Source: `client/src/workflow/components/InspectorDrawer.jsx`
- Category: basic
- Description: Right-side drawer for inspecting/editing selected node configuration and execution results
- Extractable props: `selectedNode` (object), `onUpdate` (function)
- Hardcoded: Config field definitions, drawer animation
