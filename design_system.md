# Sanocare Design System

Version: 1.0.0
Last updated: 2026-03-21
Purpose: Source-of-truth rulebook for web and PWA consistency

## 1. Brand Identity
Sanocare combines clinical credibility with warm, modern usability.

Brand attributes:
- Clinical
- Trustworthy
- Reassuring
- Modern

## 2. Design Principles
- Clarity first: every screen should reduce medical decision friction.
- Confidence by default: trust cues should be visible without clutter.
- Friendly precision: rounded, approachable UI with structured information hierarchy.
- Action orientation: critical actions are obvious and visually prioritized.

## 3. Color Palette

### Primary
- Primary: #2b8cee
  - Use for primary buttons, key links, active states, and high-priority highlights.
- Primary Dark: #1a6bb5
  - Use for hover/pressed states of primary actions.

### Background
- Background Light: #f8f9fa
  - Default page canvas for consumer surfaces.
- Background Dark: #101922
  - Reserved token for dark theme sections.

### Surface
- Surface Light: #ffffff
  - Cards, modal surfaces, nav bars, sheet backgrounds.
- Surface Dark: #1e2936
  - Reserved token for dark surfaces.

### Text
- Text Main: #0d141b
  - Headings and primary body copy.
- Text Secondary: #4c739a
  - Supporting copy, metadata, helper text.

### Accent
- Accent: #e0f2fe
  - Soft information backgrounds and subtle highlights.

### Product Meta Colors
- PWA Theme Color: #2563eb
- Logo Blue: #2b81ff

### Status Colors (derived utility palette)
- Success: #16a34a
- Warning: #f59e0b
- Error: #dc2626
- Info: #2563eb

## 4. Typography

### Font Families
- Display Serif: Playfair Display
- UI Sans: Manrope
- Fallback Sans: system-ui, sans-serif
- Fallback Serif: Georgia, serif

### Weight Scale
- 300 Light: narrative paragraphs (select use)
- 400 Regular: standard body
- 500 Medium: emphasized body
- 600 Semibold: secondary heading/labels
- 700 Bold: primary headings, CTAs, metrics

### Type Hierarchy
- H1: Playfair Display, 48-72px, medium/bold, line-height 1.1, tight tracking
- H2: Playfair Display, 36-56px, medium/bold
- H3: Manrope or Playfair, 24-32px, bold
- Body Large: Manrope, 18-20px
- Body Regular: Manrope, 14-16px
- Label/Meta: Manrope, 12px, uppercase, bold, wide tracking

## 5. Layout, Shape, and Depth

### Radius Tokens
- radius-sm: 0.5rem
- radius-md: 0.75rem
- radius-lg: 1rem
- radius-xl: 1.5rem
- radius-2xl: 2rem
- radius-pill: 9999px

### Shadow Tokens
- shadow-sm: 0 2px 8px rgba(15, 23, 42, 0.06)
- shadow-md: 0 8px 24px rgba(15, 23, 42, 0.08)
- shadow-lg: 0 16px 40px rgba(15, 23, 42, 0.12)
- shadow-brand: 0 12px 28px rgba(43, 140, 238, 0.24)

### Visual Motifs
- Glass surfaces: translucent white + blur + faint border.
- DNA pattern layer: subtle scientific texture at low opacity.
- Ambient gradient blobs: soft blue/indigo atmospherics in page background.

## 6. Component Anatomy

### Primary Button
- Fill: #2b8cee
- Hover: #1a6bb5
- Text: #ffffff
- Radius: xl or pill (contextual)
- Weight: 700
- Optional glow for priority CTAs

### Secondary (Outline) Button
- Border: primary or slate border
- Text: primary or white on dark sections
- Background: transparent to subtle tint on hover
- Radius: xl or pill

### Ghost Button
- Borderless text-first action
- Hover adds low-opacity primary tint

### Input Field
- Background: translucent white to solid white on focus
- Border: slate-200, focus to primary
- Radius: xl
- Label: uppercase micro label, wide tracking
- Optional left icon

### Card
- Standard card: surface light + soft border + medium shadow + rounded-2xl
- Glass card: translucent fill, backdrop blur, border, elevated shadow

## 7. Motion
- Hover scale: up to 1.02 for interactive elements.
- Tap scale: down to 0.98.
- Entrance: fade + short vertical offset.
- Ambient background motion: slow, continuous, low-amplitude.
- Keep timing restrained to preserve medical trust.

## 8. Ops Theme (Separate Subsystem)
Use only in operational/admin interfaces.

Dark:
- bg: #0f172a
- surface: #1e293b
- surface-hover: #334155
- border: #334155
- text: #f8fafc
- text-secondary: #94a3b8
- text-muted: #64748b

Light:
- bg: #f1f5f9
- surface: #ffffff
- surface-hover: #f8fafc
- border: #e2e8f0
- text: #0f172a
- text-secondary: #475569
- text-muted: #64748b

## 9. Token Source of Truth
Canonical source files:
- design-system/tokens/design-tokens.json
- src/design-system/tokens.css (generated)

Build command:
- npm run tokens:build

## 10. Implementation Rules for Future Agents
- Do not introduce new primary blue variants unless approved.
- Keep serif reserved for display and brand moments.
- Preserve rounded, friendly shape language.
- Keep status colors semantic and consistent.
- Reuse token variables; avoid hardcoding visual values in components.
