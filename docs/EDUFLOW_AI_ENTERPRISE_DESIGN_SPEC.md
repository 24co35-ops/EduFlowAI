# EduFlowAI — Enterprise UI/UX Design System & Frontend Architecture Spec
**Version:** 2.0.0-PROD  
**Design Philosophy:** *"Figma meets Notion for AI-Powered Education"*  
**Author:** Principal Product Designer & Lead Frontend Architect  
**Target Stack:** Next.js 16 (App Router) + React 19 + TypeScript + @xyflow/react (React Flow) + shadcn/ui + Tailwind CSS v4 + Zustand + Vercel AI SDK

---

## Visual Showcase & Architectural Concept

![EduFlowAI Workflow Builder Canvas](C:/Users/rahul/.gemini/antigravity-ide/brain/81ee1cb2-23ce-4cbe-9c6a-d8393de3d105/eduflow_canvas_ui_1790576063390.jpg)

*Figure 1: The EduFlowAI Infinite Canvas Studio — Node execution pipeline featuring YouTube Analyzer, Summarizer, Adaptive Quiz Generator, and Flashcard Creator with live data-flow telemetry and inspector panel.*

![EduFlowAI Hero Landing Page](C:/Users/rahul/.gemini/antigravity-ide/brain/81ee1cb2-23ce-4cbe-9c6a-d8393de3d105/eduflow_landing_hero_1790576085491.jpg)

*Figure 2: The EduFlowAI Public Landing Experience — Interactive mini-canvas hero showcasing live multi-agent workflow compilation with zero linear chat friction.*

---

# Part 1: Figma-Ready Design Tokens & Aesthetic Foundation

### 1.1 Brand Color System (Tailwind CSS v4 / HSL Tokens)
The color hierarchy is engineered specifically for cognitive endurance during prolonged academic sessions, pairing deep slate foundations with luminous neon accents that indicate data flow and node execution.

```css
@theme {
  /* Surface & Canvas Tokens */
  --color-canvas-bg: #020617;        /* Slate-950: Infinite canvas backdrop */
  --color-canvas-grid: #1e293b;      /* Slate-800: Dynamic dotted dot-grid */
  --color-surface-panel: #0b0f19;    /* Ultra-dense floating panels */
  --color-surface-card: #0f172a;     /* Slate-900: Node body background */
  --color-surface-hover: #1e293b;    /* Slate-800: Node interactive hover */
  --color-surface-active: #334155;   /* Slate-700: Selected node boundary */
  
  /* Brand Core Accents */
  --color-brand-primary: #2563eb;    /* Deep Royal Blue: Anchor actions */
  --color-brand-secondary: #14b8a6;  /* Vivid Teal: Data streams & research */
  --color-brand-ai: #9333ea;         /* Electric Violet: AI synthesis */
  --color-brand-ai-glow: #a855f7;    /* Ambient node execution aura */

  /* Semantic Data-Flow Status */
  --color-status-idle: #64748b;      /* Slate-500: Dormant port / node */
  --color-status-queued: #f59e0b;    /* Amber-500: Pipeline step pending */
  --color-status-running: #06b6d4;   /* Cyan-500: Active token generation */
  --color-status-complete: #10b981;  /* Emerald-500: Deterministic / AI complete */
  --color-status-error: #ef4444;     /* Rose-500: Grounding or execution fail */

  /* Port Type Signifiers (Color-Coded Handles) */
  --port-text: #38bdf8;              /* Sky-400: Raw strings & markdown */
  --port-document: #f43f5e;          /* Rose-500: PDFs, Docx, Transcripts */
  --port-structured: #8b5cf6;        /* Violet-500: JSON, Rubrics, Key-Values */
  --port-dataset: #10b981;           /* Emerald-500: Vector chunks, embeddings */
  --port-action: #f59e0b;            /* Amber-500: Triggers & Webhooks */
}
```

### 1.2 Typography Hierarchy
- **Display & Headings:** `Plus Jakarta Sans` (Geometric, contemporary, authoritative).
- **Body & UI Elements:** `Inter` (Optimized for micro-legibility at 11px–14px on dense canvas nodes).
- **Code, Vectors, JSON Preview:** `JetBrains Mono` (Zero-ambiguity font with distinct tabular glyphs).

| Scale | Size | Line Height | Tracking | Weight | Used For |
|---|---|---|---|---|---|
| **Display 2XL** | 64px | 72px | -0.025em | Bold (700) | Landing Page Hero Headline |
| **Heading XL** | 36px | 44px | -0.02em | SemiBold (600) | Dashboard & Studio Title |
| **Heading LG** | 24px | 32px | -0.015em | SemiBold (600) | Inspector Drawer Section Headers |
| **Heading MD** | 16px | 24px | -0.01em | Medium (500) | Node Card Title & Modal Headers |
| **Body Standard** | 14px | 20px | 0 | Regular (400) | Node Configuration Form Labels |
| **Body Small** | 12px | 16px | +0.01em | Regular / Med | Port Names, Metadata, Status Badges |
| **Micro Code** | 11px | 14px | +0.02em | Regular (400) | JSON Previews, Token Burn Telemetry |

### 1.3 Spacing, Borders & Glassmorphic Elevation
- **Grid Unit:** 8pt modular grid (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- **Radii:**
  - Nodes: `rounded-2xl` (`16px`) with 1px border `border-white/10`.
  - Action Chips & Badges: `rounded-full` (`9999px`).
  - Inputs & Menus: `rounded-xl` (`10px`).
- **Shadow Tokens:**
  - Canvas Node Resting: `0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)`
  - Active Executing Glow: `0 0 25px -2px rgba(147, 51, 234, 0.45), 0 0 10px rgba(37, 99, 235, 0.3)`
  - Backdrop Blur: `backdrop-blur-xl bg-slate-900/80 border border-slate-800/80`

---

# Part 2: Complete Sitemap & Information Architecture

```
EduFlowAI Information Architecture
├── (Public Landing & Evaluation)
│   ├── / ............................... Dynamic Landing Page + Live Interactive Hero Canvas
│   ├── /templates ...................... Public Workflow Template Marketplace
│   ├── /agents ......................... 11 AI Agents Interactive Capabilities Directory
│   ├── /pricing ........................ Student, Teacher Pro, & University Campus Tiers
│   └── /security ....................... FERPA, COPPA & watsonx Grounding Whitepaper
├── (Authenticated App Shell)
│   ├── /dashboard ...................... Mission Control (Recent Workflows, Quick Stats, Token Burn)
│   ├── /workflows ...................... Workflow Library (Personal, Shared, Team Projects)
│   │   ├── /workflows/[id] ............. Infinite Visual Canvas Studio (The Core Engine)
│   │   ├── /workflows/[id]/runs ........ Historical Execution Tracing & Logs
│   │   └── /workflows/[id]/analytics ... Node-by-node Latency, Success Rate & Token Costs
│   ├── /vault (Files) .................. Multi-Modal Knowledge Vault (PDFs, Videos, URLs)
│   ├── /templates/gallery .............. Institutional & Community Workflow Repository
│   ├── /analytics ...................... Institutional Academic ROI & Time Saved Dashboard
│   ├── /collaboration .................. Real-Time Team Spaces & Multi-user Access
│   └── /settings
│       ├── /settings/profile ........... Personal Identity & Quercus/Canvas OAuth
│       ├── /settings/workspace ......... Workspace RBAC, Team Invites & Permissions
│       ├── /settings/integrations ...... LMS LTI 1.3, Google Classroom, Blackboard Keys
│       └── /settings/admin ............. Enterprise Admin, SSO (SAML), Audit & FERPA Logs
└── (Developer & API Portal)
    ├── /docs ........................... Comprehensive Mintlify-style Documentation
    ├── /docs/agents .................... Agent Input/Output Schemas & Prompt Engineering
    └── /docs/api ....................... REST Endpoints, WebSocket Streams, Webhooks
```

---

# Part 3: Section-by-Section Wireframe & Component Breakdown

### 1. Landing Page (Public)
- **Primary Goal:** Convert student anxiety and teacher administrative overload into immediate workflow empowerment.
- **Hero Unit:** 
  - Dual-action header with badge: `✨ Next.js 16 + React Flow Native Architecture`.
  - Massive title: *"Turn 2-Hour Lectures into Flashcards in Minutes"*.
  - Live interactive mini-canvas embedded directly in the hero. Users can drag a YouTube node, connect it to a Summarizer, and see a simulated 3-second live extraction without signing up!
- **Components Used:**
  - `shadcn/badge`: Status tag.
  - `shadcn/button`: Glowing `variant="default"` and glassmorphic `variant="outline"`.
  - `@xyflow/react`: Compact interactive hero canvas instance with custom node skins.
  - `lucide-react`: ArrowRight, Sparkles, Cpu, ShieldCheck.
- **Trust Strip:** Animated carousel featuring MIT, Stanford, Harvard, Oxford, and University of Toronto logos with high-contrast monochrome opacity.

### 2. Authenticated App Shell
- **Structure:** 3-column architecture (Collapsible Workspace Sidebar + Top Contextual Navbar + Dynamic Drawer).
- **Global Command Center (`Cmd + K` / `Ctrl + K`):**
  - Instant navigation across workflows, templates, recent files, and agent definitions.
  - Quick action to trigger: *"Run Last Workflow"*, *"Upload Lecture PDF"*, *"Export to Anki"*.
- **Workspace Switcher:** Dropdown supporting `Personal (Student)`, `Biology 101 (Teaching Assistant)`, and `State University (Institutional Admin)`.

### 3. Mission Control Dashboard
- **Welcome Hero Card:** Personalized greeting with dynamic context (*"Good afternoon, Alex. 3 assignments due in 48 hours. Let's automate your review."*).
- **KPI Metrics (Sparkline Banners):**
  - `Workflows Active`: 14 (+3 this week)
  - `AI Tasks Automated`: 342 runs
  - `Academic Time Saved`: **18.4 Hours** (calculated dynamically: $NodeCount \times EstimatedManualMinutes$)
  - `Grounding Accuracy Rate`: 99.4% (Grounded via RAG & Watsonx Granite citations)
- **Visuals:** Recharts dynamic area charts showing token consumption and throughput over 30 days.

---

# Part 4: Workflow Canvas Studio (Core Engine)

![EduFlowAI Canvas System Design](C:/Users/rahul/.gemini/antigravity-ide/brain/81ee1cb2-23ce-4cbe-9c6a-d8393de3d105/eduflow_canvas_ui_1790576063390.jpg)

### 4.1 The Infinite Workspace Specifications
- **Canvas Engine:** `@xyflow/react` v12 with WebGL rendering for 500+ simultaneous nodes.
- **Background:** Dynamic dotted grid (`color="#1e293b"`, `gap={24}`, `size={1.5}`).
- **Edge Routing:** Custom bezier edge `DataFlowEdge` with animated SVG glowing packets flowing at variable speeds proportional to execution time.
- **Port Matching & Type Safety:** 
  - Connection between mismatched ports (e.g., `PortType.DOCUMENT` $\rightarrow$ `PortType.ACTION`) triggers a subtle red invalidation snap and toast notification.
  - Automatic type coercion is offered for compatible ports (e.g., `PortType.DOCUMENT` $\rightarrow$ auto-inserts a `TextExtractor` adapter).

### 4.2 Canvas Control Toolbar
- **Run Workflow Button:** Luminous purple button with pulse state, keyboard shortcut indicator (`Cmd + Enter`), and execution step ticker (`Step 2/4 Running...`).
- **History Controls:** Full Undo/Redo stack powered by Zustand temporal middleware (`Cmd + Z` / `Cmd + Shift + Z`).
- **Multiplayer Presence:** Live floating avatar cursors (Figma-style) showing team members' active cursors, selected nodes, and real-time execution states.

---

# Part 5: The 11 Specialized AI Agent Nodes

| # | Agent Name | Category | Primary Inputs | Primary Outputs | Execution Engine & Deterministic Rule |
|---|---|---|---|---|---|
| **01** | **Essay Grader** | Assessment | `Essay Text`, `Rubric Criteria`, `Grade Scale` | `Overall Score`, `Rubric Breakdown`, `Actionable Feedback` | IBM Granite 20B Instruct. Subjective feedback formatted as structured JSON; exact rubrics calculated with deterministic math. |
| **02** | **Fact Checker** | Verification | `Claim Statements`, `Source Documents` | `Verification Verdict`, `Citations`, `Confidence Score` | Perplexity / Brave Search + Granite Grounding. Outputs `VERIFIED`, `CONTRADICTED`, or `UNSUBSTANTIATED`. |
| **03** | **Text Improver** | Synthesis | `Draft Text`, `Tone Preset`, `Target Reading Level` | `Polished Text`, `Diff Highlighting`, `Readability Delta` | Gemini 1.5 Pro / Granite. Generates inline GitHub-style diffs showing vocabulary upgrades. |
| **04** | **Summarizer** | Extraction | `Long-form Text / Transcript`, `Format Mode` | `Executive Summary`, `Key Bullet Points`, `Action Items` | Recursive chunking summarizer with strict token preservation. |
| **05** | **Concept Extractor**| Ontology | `Lecture Notes`, `Course Syllabus` | `Key Terms`, `Hierarchical Taxonomy`, `Flashcard Seeds` | Extracts concepts, definitions, and mental model relationships with prerequisite graphs. |
| **06** | **Study Plan Gen** | Scheduling | `Syllabus`, `Exam Date`, `Daily Study Capacity` | `Milestone Schedule`, `Daily Focus Blocks`, `Calendar (.ics)` | Spaced repetition scheduler based on SuperMemo SM-2 algorithm. |
| **07** | **Web Search** | Research | `Search Query`, `Domain Filter`, `Max Results` | `Raw Search Results`, `Extracted Excerpts`, `URL Citations` | Live academic search via Brave Search API & Semantic Scholar. |
| **08** | **YouTube Analyzer**| Multi-Modal | `YouTube URL`, `Language Code` | `Full Transcript`, `Timestamped Chapters`, `Visual Slides OCR` | ElevenLabs Whisper transcription + YouTube transcript fetcher with timestamp bookmarks. |
| **09** | **PDF Reader** | Document | `PDF Binary File`, `Chunk Strategy` | `Extracted Text Chunks`, `Detected Tables`, `Figure Metadata` | `pdf-parse` + OCR pipeline with structural markdown retention. |
| **10** | **Browser Agent** | Automation | `Target URL`, `Extraction Instructions` | `Structured JSON Data`, `Page Screenshot`, `Status Code` | Headless Playwright / Puppeteer agent with academic paywall handling. |
| **11** | **Quiz Generator** | Assessment | `Study Material`, `Question Count`, `Difficulty` | `Multiple Choice Array`, `Flashcards (.apkg)`, `Explanations` | **Deterministic Rule:** Questions & options generated strictly from curriculum text; keys deterministically validated. |

---

# Part 6: Node Configuration Panel (The Inspector)

When any node is selected, a 420px glassmorphic inspector drawer glides in from the right edge with a spring animation (`stiffness: 300, damping: 30`).

### Tabbed Architecture:
1. **Configuration Tab:**
   - **Model Selector:** Dropdown with logos (IBM Granite 13B / 20B, Gemini 1.5 Flash, Claude 3.5 Sonnet, Local Smart Engine).
   - **Temperature / Creativity Slider:** Interactive slider with live label (*0.0 = Deterministic Exact, 1.0 = Highly Creative*).
   - **Agent-Specific Knobs:** E.g., for Essay Grader: Rubric weight matrix, word count cap, academic level selector (High School, Undergraduate, Post-Grad).
   - **Custom System Instructions:** Expandable code textarea with syntax highlighting.
2. **Input Preview Tab:** Live view of the incoming payload arriving from connected predecessor nodes, with formatted JSON tree and token counter.
3. **Output Preview Tab:** Real-time token streaming output with a single-click *"Copy Markdown"*, *"Export to Anki"*, or *"Download CSV"*.
4. **Telemetry & History Tab:** Execution time breakdown ($T_{prompt}$, $T_{inference}$, $T_{validation}$), exact cost in micro-cents, and model provenance verification.

---

# Part 7: Templates Gallery & Community Marketplace

### Curated Starter Templates:
- 🎓 **"Lecture to Masterclass"**: YouTube Video $\rightarrow$ Transcript Extractor $\rightarrow$ Concept Extractor $\rightarrow$ Anki Flashcards $\rightarrow$ 10-Question Self-Check.
- 📝 **"Essay Polish & Verification"**: Draft Input $\rightarrow$ Fact Checker $\rightarrow$ Rubric Scoring $\rightarrow$ Text Improver $\rightarrow$ Final Annotated PDF.
- 📅 **"Exam Countdown Crammer"**: Syllabus PDF $\rightarrow$ Exam Date Input $\rightarrow$ Study Plan Generator $\rightarrow$ Calendar Export.
- 🏫 **"Institutional Admissions Screener"**: Application PDF $\rightarrow$ Transcript Parser $\rightarrow$ Prerequisite Validator $\rightarrow$ Review Summary for Admissions Committee.

---

# Part 8: Real-Time State Architecture & Code Scaffolds

The frontend state architecture uses **Zustand** with local storage hydration and WebSocket synchronization.

### 8.1 Directory Blueprint (`EduFlowAI-Frontend`)

```
EduFlowAI-Frontend/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                    # Landing page with interactive mini-canvas hero
│   │   │   └── templates/page.tsx          # Public template directory
│   │   ├── (studio)/
│   │   │   ├── workflows/[id]/page.tsx     # The Visual Workflow Canvas Studio
│   │   │   └── layout.tsx                  # Canvas layout with zero outer scroll
│   │   └── (dashboard)/
│   │       ├── dashboard/page.tsx          # Mission Control metrics
│   │       ├── vault/page.tsx              # Knowledge base file manager
│   │       └── analytics/page.tsx          # Institutional ROI charts
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── WorkflowCanvas.tsx          # Primary React Flow wrapper
│   │   │   ├── CanvasToolbar.tsx           # Run, Undo, Zoom, Share controls
│   │   │   ├── NodePalette.tsx             # Draggable agent sidebar
│   │   │   ├── InspectorDrawer.tsx         # Slide-out configuration panel
│   │   │   └── edges/
│   │   │       └── DataFlowEdge.tsx        # Animated SVG bezier curve
│   │   ├── nodes/
│   │   │   ├── BaseNode.tsx                # Master container with handles & chrome
│   │   │   ├── AgentNode.tsx               # AI Agent execution node
│   │   │   ├── DocumentNode.tsx            # File ingest node
│   │   │   └── OutputNode.tsx              # Export & terminal node
│   │   └── ui/                             # shadcn/ui library primitives
│   ├── features/
│   │   ├── execution/
│   │   │   ├── orchestrator.ts             # Topological sort & execution pipeline
│   │   │   └── nodeExecutors.ts            # Vercel AI SDK & Granite runners
│   │   └── store/
│   │       ├── useWorkflowStore.ts         # Graph nodes, edges, selections
│   │       └── useExecutionStore.ts        # Live token streaming & runtime status
│   └── styles/
│       └── globals.css                     # Tailwind v4 theme tokens
```

---

# Part 9: Verification, Accessibility & Institutional Compliance

1. **Deterministic Grounding Verification:**
   - Any quiz or factual node strictly honors AGENTS.md rules: subjective responses use IBM Granite / Vercel AI SDK, while MCQ correct answers are indexed and checked deterministically.
   - Out-of-scope inquiries output polite redirects with explicit citation badges (`[Source: Chapter X, Page Y]`).
2. **Accessibility (WCAG 2.1 AA):**
   - High contrast ratios (minimum 4.5:1 on text elements against `slate-950`).
   - Full keyboard navigation for Canvas: `Tab` to cycle nodes, `Arrow Keys` to nudge, `Enter` to open Inspector, `Escape` to dismiss.
3. **FERPA / COPPA Guardrails:**
   - Zero student PII is transmitted in model inference prompts.
   - All uploaded curriculum docs are segmented and encrypted at rest with AES-256 in Supabase Storage.
