# Rule 02: Coding Standards & Architecture Patterns

## 1. Multi-Tier Boundaries
- **Client**: React 18 with Vite and Tailwind CSS. Clean, responsive, dark/light balanced UI with zero decorative AI bloat.
- **Server**: Express.js REST API with modular controllers, middlewares, models, and service abstractions.
- **AI Gateway Layer**: All AI invocations route strictly through `server/services/ai/` (`AIService`, `BobProvider`, `FallbackProvider`, `telemetry`). Direct axios calls to AI endpoints from controllers are strictly prohibited.

## 2. API & Controller Contracts
- Always return consistent JSON envelopes: `{ success: true, ... }` or `{ success: false, error: '...' }`.
- AI responses must include `_aiMetadata` carrying provider provenance, model ID, latency (ms), and fallback status.
- Strict authorization: enforce role-based access control (RBAC) and ownership verification (`verifyCourseOwnership`, IDOR protection on student attempts).

## 3. State Management & Human-in-the-Loop
- Quizzes transition from `draft` → `review` → `published`.
- Never auto-publish generated quizzes without providing a draft state for teacher inspection.
- In-place mutation endpoints (`PATCH /api/quizzes/:id`) and regeneration (`POST /api/quizzes/:id/regenerate-question`) must preserve unmodified items.
