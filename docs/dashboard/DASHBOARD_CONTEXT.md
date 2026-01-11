# Dashboard Context (UI-focused)
Scope: Dashboard only — UI, UX, behavior
Do NOT include ticket logic, backend rules, or infra details here.

## 1. Purpose
The Dashboard is an internal overview screen.
Its goals are:
- Provide a clean, calm, professional UI
- Help users quickly understand system state at a glance
- Act as a navigation hub to deeper sections (Servers, Apps, Tickets later)

This is NOT:
- A heavy analytics page
- A configuration or form-heavy screen

## 2. Design Principles (Strict)
- Visual style: calm, neutral, non-distracting (YouTrack-like feel)
- One visual language only (no multiple themes)
- Readability > decoration
- Information density must be controlled

## 3. Layout Rules
- Clear visual hierarchy:
  - Page title
  - High-level summary blocks
  - Lists / tables / widgets
- Avoid clutter:
  - No nested cards inside cards
  - No excessive borders
- Consistent padding and alignment across sections

## 4. Components & Patterns
- Use HeroUI components consistently
- Cards:
  - Used only for grouping related information
  - Same radius, padding, and header style
- Tables:
  - Custom cells allowed
  - Alignment must be pixel-consistent
- Buttons:
  - Primary actions only
  - Avoid multiple CTA styles in one view

## 5. Empty / Loading / Error States
All dashboard widgets must support:
- Loading: skeleton matching final layout
- Empty: clear message + subtle icon (no loud illustrations)
- Error: short explanation + retry action

No raw spinners. No blank areas.

## 6. Dark Mode Rules
- No pure black backgrounds
- Text contrast must remain comfortable for long viewing
- Cards and sections must still be visually separated
- Chips / badges must remain readable in dark mode

Dark mode is NOT an afterthought.

## 7. Interaction Rules
- No surprise interactions
- Hover states must be subtle
- Click targets must be clear
- Avoid hidden actions inside icons unless obvious

## 8. Non-goals (Explicit)
- Do not refactor unrelated pages
- Do not introduce new UI libraries
- Do not redesign navigation unless explicitly asked

## 9. AI Working Rules (For Cursor)
Before making changes:
1. Read this file first
2. Only touch dashboard-related files
3. Apply minimal diffs
4. Preserve existing behavior unless explicitly requested
5. Re-check dark mode + empty/loading states after changes
