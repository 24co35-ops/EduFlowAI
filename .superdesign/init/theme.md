# Theme — Design Tokens & CSS Variables

## Part 1 — Compact Token Summary

### Color Palette (Dark Mode — Primary)
The app uses a dark slate theme with indigo/purple accent gradients:

| Token | Value | Usage |
|---|---|---|
| Background | `slate-950` (#020617) | Page background, body |
| Surface | `slate-900` (#0f172a) | Cards, sidebar bg |
| Surface Glass | `rgba(15, 23, 42, 0.7)` | Glassmorphism cards (.glass-card) |
| Surface Subtle Glass | `rgba(15, 23, 42, 0.45)` | Lighter glass panels |
| Border Primary | `slate-800` (#1e293b) | Card borders, dividers |
| Border Subtle | `rgba(255, 255, 255, 0.07)` | Glass card borders |
| Text Primary | `slate-100` (#f1f5f9) | Headings, body text |
| Text Secondary | `slate-400` (#94a3b8) | Descriptions, labels |
| Text Muted | `slate-500` (#64748b) | Captions, meta text |
| Brand Primary | `indigo-600` (#4f46e5) | Active states, buttons, nav highlights |
| Brand Glow | `indigo-500/20` | Hover glows, tag backgrounds |
| Brand Gradient | `from-blue-600 via-indigo-500 to-purple-600` | Logo, accent badges |
| Accent Gradient Text | `from-blue-400 via-indigo-300 to-purple-400` | .gradient-text class |
| IBM Blue | `#0f62fe` | IBM brand reference |
| Success | `emerald-400` (#34d399) | Verified badges, positive indicators |
| Warning | `amber-400`/`amber-500` | Fallback indicators |
| Selection | `indigo-500/30` | Text selection highlight |

### Stationery Palette (Landing Page Only)
| Token | Value | Usage |
|---|---|---|
| Ground | `#EFE9DD` | Landing page background |
| Ground Secondary | `#E5DED0` | Hero section, alternating sections |
| Ink | `#141C2B` | Primary text on landing |
| Ink Secondary | `#4A5364` | Body text on landing |
| Ink Muted | `#767E8C` | Captions on landing |
| Ink Blue | `#2C4A8F` | Accent type, rules, SVG strokes (NEVER filled) |
| Hairline | `rgba(20, 28, 43, 0.16)` | Divider lines on landing |

### Typography
| Token | Value | Usage |
|---|---|---|
| `font-sans` | `Inter, sans-serif` | Default body text across app |
| `font-outfit` | `Outfit, sans-serif` | Brand wordmark "EduFlow AI" |
| `font-newsreader` | `Newsreader, Georgia, serif` | Landing page headings (letter-spacing: -0.02em) |
| `font-typewriter` | `"Courier Prime", Courier, monospace` | Landing page body/labels (letter-spacing: 0.07em, line-height: 1.9) |

### Spacing & Layout
- Max content width: `max-w-7xl` (80rem / 1280px)
- Sidebar width: `w-64` (16rem / 256px)
- Navbar height: `h-16` (4rem / 64px)
- Page padding: `px-4 sm:px-6 lg:px-8 py-8`
- Card padding: `p-4` to `p-6`
- Gap: `gap-8` (main layout), `gap-4`–`gap-6` (card grids)

### Border Radius
- Cards: `rounded-2xl` (1rem)
- Buttons: `rounded-xl` (0.75rem)
- Badges/Tags: `rounded` (0.25rem) to `rounded-lg` (0.5rem)
- Logo: `rounded-xl` (0.75rem)
- Landing page: `border-radius: 0` everywhere (enforced via `.stationery-page * { border-radius: 0 !important }`)

### Shadows
- Card hover: `shadow-lg shadow-indigo-600/25` (active nav), `box-shadow: 0 12px 32px -8px rgba(99, 102, 241, 0.22)` (glass hover)
- Logo: `shadow-lg shadow-indigo-500/20`

### Breakpoints (Tailwind defaults)
- `sm`: 640px
- `md`: 768px (sidebar visible)
- `lg`: 1024px
- `xl`: 1280px

---

## Part 2 — Raw Source Dumps

### tailwind.config.js
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ibm: {
          blue: '#0f62fe',
          darkBlue: '#0043ce',
          purple: '#8a3ffc',
          cyan: '#1192e8',
          teal: '#009d9a'
        },
        stationery: {
          ground: '#EFE9DD',
          groundSec: '#E5DED0',
          ink: '#141C2B',
          inkSec: '#4A5364',
          muted: '#767E8C',
          blue: '#2C4A8F',
          hairline: 'rgba(20,28,43,0.16)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        newsreader: ['Newsreader', 'Georgia', 'serif'],
        typewriter: ['"Courier Prime"', 'Courier', 'monospace']
      }
    },
  },
  plugins: [],
}
```

### index.css (key sections)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-brand-primary: #6366f1;
    --color-brand-secondary: #3b82f6;
    --color-brand-accent: #a855f7;
  }
  body {
    @apply bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200;
  }
}

.glass-card {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.gradient-text {
  @apply bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400;
}

/* Stationery landing page scoped styles */
.stationery-page {
  --bg-ground: #EFE9DD;
  --bg-ground-sec: #E5DED0;
  --ink-primary: #141C2B;
  --ink-sec: #4A5364;
  --ink-muted: #767E8C;
  --ink-blue: #2C4A8F;
  --hairline: rgba(20, 28, 43, 0.16);
  background-color: var(--bg-ground);
  color: var(--ink-primary);
  font-family: 'Courier Prime', Courier, monospace;
  letter-spacing: 0.07em;
  line-height: 1.9;
}
.stationery-page * { border-radius: 0 !important; }
```
