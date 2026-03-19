# Design Bible

Knowledge base for CSS design decisions. Read on demand by agents — not embedded in prompts.

---

## Anti-Patterns (AI Slop — NEVER)

These are fingerprints of generic AI-generated interfaces. If you catch yourself doing any of these, STOP and choose differently.

### Color
- Cyan-on-dark backgrounds
- Purple-to-blue gradients
- Neon glows / accents on dark backgrounds
- Dark mode as default (lazy — requires no real design decisions)
- Gradient text on headings or metrics
- Pure black (#000) or pure white (#fff) — always tint

### Layout
- Hero with 3 floating metrics (big number + small label + gradient accent)
- Grid of identical cards (same size, icon + heading + text, repeated endlessly)
- Cards nested inside cards
- Everything centered — left-aligned with asymmetric layouts feels more designed
- Same spacing everywhere (no rhythm)

### Visual
- Glassmorphism (frosted glass, blur effects, glow borders) used decoratively
- Rounded rectangles with generic drop shadows
- Rounded element with thick colored border on one side
- Sparklines as decoration (tiny charts conveying nothing)
- Large icons with rounded corners above every heading

### Motion
- Bounce / elastic / spring easing — dated, tacky. Real objects decelerate smoothly.
- Animating layout properties (width, height, top, left) — use transform + opacity only

### Typography
- Overused heading fonts: Inter, Roboto, Open Sans, Arial, Lato, Montserrat
- Monospace typography as lazy shorthand for "technical"
- More than 2-3 font families

---

## Core Principles

1. **Every visual choice must have INTENT** — not be a default
2. **Hierarchy through multiple dimensions**: size + weight + color + position + space
3. **Less = more**: remove before adding
4. **Consistency > creativity**: pick a direction and commit
5. **Opinionated > options**: make ONE strong recommendation, don't offer 3 alternatives

---

## Typography

- Use `clamp()` for fluid sizing: `clamp(min, preferred, max)`
- **Contrast heading/body**: serif + sans, or geometric + humanist
- **Minimum 16px** body text; touch targets 44px
- Font loading: `font-display: swap` + fallback metrics matching
- Vertical rhythm: line-height as base unit for ALL vertical spacing
- 5-size system: xs, sm, base, lg, xl+ (fewer sizes with more contrast)
- Measure: `max-width: 65ch` for readable line length
- Better alternatives: Instead of Inter use Instrument Sans, Plus Jakarta Sans, Outfit

---

## Color & Contrast

- **Tinted neutrals**: add brand hue to grays (never pure gray)
- **60-30-10 rule**: 60% neutral, 30% secondary, 10% accent
- As you move toward white/black, **reduce saturation** (high chroma at extreme lightness looks garish)
- WCAG AA: **4.5:1** text normal, **3:1** text large (18px+ or 14px bold)

### Dangerous Combinations (NEVER)
- Gray text on colored backgrounds (washed out)
- Red + green together (8% of men are colorblind)
- Yellow on white (almost always fails contrast)
- Blue on red (vibrates visually)
- Thin light text on images (unpredictable contrast)

---

## Spatial Design

- **Base 4pt grid**: 4, 8, 12, 16, 24, 32, 48, 64px
- Use `gap` for sibling spacing (eliminates margin collapse)
- **Cards are overused** — spacing and alignment create grouping naturally
- Touch targets: minimum **44x44px** (use padding or pseudo-elements to expand)
- The Squint Test: blur your eyes — can you identify hierarchy and groupings?
- Hierarchy: 2-3 dimensions at once (larger + bolder + more surrounding space)

---

## Motion & Animation

| Duration | Use |
|----------|-----|
| 100-150ms | Instant feedback (button press, toggle) |
| 200-300ms | State changes (menu, tooltip, hover) |
| 300-500ms | Layout changes (accordion, modal) |
| 500-800ms | Entrance animations (page load, hero) |

- Exits are faster: ~75% of entrance duration
- **Only animate `transform` and `opacity`** (GPU-composited)
- Use exponential easing (ease-out-quart/quint): `cubic-bezier(0.25, 1, 0.5, 1)`
- Respect `prefers-reduced-motion` — crossfade instead of spatial movement
- Cap stagger: 10 items at 50ms = 500ms max total

---

## Interaction

- **8 states**: default, hover, focus, active, disabled, loading, error, success
- Focus rings: `:focus-visible` with 2-3px, offset, 3:1 contrast
- Never `outline: none` without replacement
- Progressive disclosure: start simple, reveal through interaction
- Optimistic UI for low-stakes actions (update immediately, sync later)
- Skeleton screens > spinners

---

## Responsiveness

- **Mobile-first**: base styles for mobile, `min-width` queries to layer up
- Content-driven breakpoints, not device sizes
- Three breakpoints usually suffice: 640, 768, 1024px
- Use `clamp()` for fluid values without breakpoints
- **Detect input method**: `@media (pointer: coarse)` for touch, `(hover: hover)` for hover
- Don't hide critical functionality on mobile — adapt, don't amputate

---

## UX Writing

- Button labels: specific verb + object ("Save changes" not "OK")
- Errors: what happened + why + how to fix
- Empty states: acknowledge + value + clear action
- Never blame the user
- Pick ONE term and stick with it (Delete not Remove/Trash)
- Redundancy kills: if the heading explains it, skip the intro

---

## Style Parameters

When user asks for a "style", map to concrete decisions:

### Luxury / Elegante
Serif headings, subtle shadows, gold/navy palette, generous spacing, slow animations (400-600ms), 60-30-10 heavily weighted to neutral

### Moderno / Clean
Geometric sans-serif, flat surfaces, vibrant accents, tight grid, fast transitions (150-250ms), minimal decoration

### Bold / Impactante
Extreme scale contrast, high color contrast, asymmetric layouts, dramatic animations (300-500ms), large typography

### Minimal / Quiet
Few elements, generous white space, muted/desaturated colors, micro-animations only, maximum restraint
