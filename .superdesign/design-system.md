# Design System — The Calibrated Maker's Stationery

## 1. Product Context & Identity
- **Product**: EduFlow AI — Intelligent Course Content Automation & Prerequisite Graph System (IBM Hackathon 2026).
- **Core Philosophy**: Honest, high-contrast, scientific & technical stationery aesthetic. Emphasizes deterministic grading, truthful AI telemetry (IBM Granite models), and pedagogical precision.
- **Tone**: Academic, maker-crafted, calibrated instrument, archival paper, disciplined ink.

---

## 2. Color Palette & Ground
The stationery style is strictly defined by an archival warm paper ground, disciplined near-black ink, and a single accent ink blue reserved exclusively for emphasis and strokes (never filled).

| Token | CSS / Hex | Purpose |
|---|---|---|
| `ground` | `#EFE9DD` | Primary paper substrate (page ground) |
| `ground-sec` | `#E5DED0` | Secondary paper ground (cards, alternating sections, headers) |
| `ink` | `#141C2B` | Primary deep ink text and structural solid strokes |
| `ink-sec` | `#4A5364` | Secondary ink for body copy, descriptions, and metadata |
| `ink-muted` | `#767E8C` | Captions, timestamps, inactive tabs, subtle notations |
| `ink-blue` | `#2C4A8F` | Accent ink blue for key highlights, italic emphasis, active rules, active status indicators (NEVER as solid fill) |
| `hairline` | `rgba(20, 28, 43, 0.16)` | Precision hairline borders, grid dividers, split rules |

---

## 3. Typography Rules
High contrast between an expressive literary serif and an authentic typewriter monospace.

| Role | Font Family | Weight & Size | Tracking / Leading | Usage Rules |
|---|---|---|---|---|
| **Display & Headings** | `'Newsreader', Georgia, serif` | 400–600, 24px–72px | `letter-spacing: -0.02em`, `line-height: 1.15` | All primary section titles, hero headlines, key question statements. |
| **Emphasised Phrase** | `'Newsreader', Georgia, serif` | *Italic*, 400 | Italic style | Reserved strictly for highlighted phrases in headings; paired with `text-[#2C4A8F]`. |
| **Labels & Data** | `'Courier Prime', Courier, monospace` | 700, 10px–12px | `letter-spacing: 0.08em–0.1em`, uppercase | Navigation items, metric labels, telemetry readouts, status badges, table headers. Format with bracket accents e.g. `[ 12 / 12 ACTIVE ]`. |
| **Body & Prose** | `'Courier Prime', Courier, monospace` | 400, 11px–13px | `letter-spacing: 0.05em`, `line-height: 1.85–1.9` | Descriptions, explanations, quiz options, analysis findings. |

---

## 4. Architectural & Layout Rules
- **Border Radius**: `border-radius: 0 !important;` — Absolute zero across all containers, inputs, buttons, badges, and modals.
- **Dividers & Borders**: 1px solid hairline `border-[rgba(20,28,43,0.16)]`. No thick borders; visual separation is achieved through rhythm, hairlines, and contrast between `#EFE9DD` and `#E5DED0`.
- **Shadows**: No blur shadows (`box-shadow: none`). If depth is required, use hard 1px/2px offset ink borders.
- **Buttons & Interactive Elements**:
  - Primary button: Solid `#141C2B` background with `#EFE9DD` typewriter text, uppercase bracketed e.g. `[ Initiate Assessment ]`.
  - Secondary / Outline button: Transparent background with `1px solid rgba(20,28,43,0.16)`, `#141C2B` text, hover with `#E5DED0` background.
  - Active tabs: Underlined with `2px solid #2C4A8F`, `#2C4A8F` text.
- **Telemetry & Provenance**: Every AI output must display metadata (Model name, latency ms, deterministic verification hash) in monospace bracketed syntax.
