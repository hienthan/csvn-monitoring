Prompt tối ưu (copy dùng ngay – không lan man)

Implement a YouTrack-inspired theme + sidebar system for this internal monitoring app using HeroUI theming (create-theme + tailwind plugin). Do not do a pixel-perfect clone; focus on the same calm enterprise vibe.

1) Sidebar IA + naming (reduce emptiness)

Restructure sidebar navigation:

Create a parent section Infrastructure containing:

Servers

Deployed Apps (rename from “Applications”)

Ports (only if used)

Backup Status (either under Infrastructure or standalone, choose one consistent structure)

Create a parent section Tickets containing:

Tickets (list) (exact /tickets)

New Ticket (/tickets/new)

Add subtle section headers and optional small counts/badges (only if data exists). No extra random items.

2) Theme foundations (fix harsh white + ugly dark mode)

Add a custom HeroUI theme named youtrack-calm via create-theme and register it in the HeroUI tailwind plugin (“add-the-new-theme-to-the-plugin”).

Define BOTH light and dark palettes with these constraints:

Light: background is very light cool gray (NOT pure white). Content surfaces slightly warmer/softer than background.

Dark: background is deep bluish-gray (NOT pure black). Content surfaces slightly lighter than background.

Primary: calm blue (not neon).

Borders: subtle divider.

Text: off-white in dark, dark neutral in light.

Apply semantic tokens globally: bg-background, bg-content1, bg-content2, text-foreground, border-divider. Remove pure black/white hardcoding.

3) Sidebar styling (YouTrack-like, token-driven)

Restyle sidebar using theme tokens (avoid hardcoded colors):

Background uses theme surface (with optional very subtle gradient in dark mode only).

Active item: calm blue text/icon + thin left indicator bar.

Hover: slight background tint only.

Inactive items: muted text/icons.

Consistent spacing, icon alignment, and fixed width.

Ensure sidebar never causes horizontal scroll.

4) App-wide dark mode quality

Ensure dark mode looks “quiet”:

Use content surfaces for cards/tables instead of black backgrounds.

Minimal shadows; prefer subtle borders.

Table headers have a slightly different surface tint; row hover is subtle.

Add a theme toggle (light/dark) and keep it consistent across routes.

Acceptance criteria

Light mode is not harsh white; dark mode is not pure black.

Sidebar looks calm and professional (YouTrack vibe), not high-contrast.

Navigation naming and grouping feel logical and not empty.

No horizontal scrolling introduced.

Entire app uses the same tokens; sidebar and content feel cohesive.

Implement a YouTrack-inspired theme using HeroUI theming.
Important: only implement one theme named youtrack-calm (light + dark).
Do NOT create multiple themes or theme variants at this stage to avoid visual inconsistency and UI bugs.

---

Part 2:
2) Prompt để Cursor “auto-compare light vs dark” và cân lại contrast (không đổi layout)

Copy nguyên khối:

Refine dark mode only for the existing youtrack-calm theme. Do not change layout or component structure.

Apply this exact dark palette:

background: #0B1220

content1: #101B2D

content2: #13223A

divider/border: #22314A

foreground: #E6EDF7

muted text: #A8B3C7 (secondary), #7F8BA3 (tertiary)

primary: #4B8DFF (hover #3D7EF0)

hover surface: #172844

sidebar base: #0A1426; sidebar hover rgba(255,255,255,0.06); sidebar active bg rgba(75,141,255,0.16); indicator #4B8DFF

Contrast & layering rules:

Background < content1 < content2 must be clearly distinguishable.

Tables & cards must sit on content1; table headers and filter bars on content2.

Use borders (divider) for separation; avoid heavy shadows in dark mode.

Reduce saturation/glow in dark mode (no neon, no strong gradients).

Chips use muted semantic backgrounds (10–18% alpha) and readable text.

Add a dev-only visual QA helper:

Create a /theme-preview route (or a hidden component) that renders the same UI blocks in both modes side-by-side:

Topbar, Sidebar, Card, Table (with header + hover row), Input, Select, Buttons, Chips.

Add a toggle to force light/dark and a note showing which tokens are applied.

Use this preview to adjust tokens until both modes look cohesive and readable.

Acceptance:

Dark mode is bluish-gray (not pure black), with clear layer separation.

Sidebar and content are distinct.

Tables/filters are readable and not flat-on-flat.

Light mode remains unchanged.

----

Part 3:

Refine dark mode only for the existing youtrack-calm theme.
Do NOT change layout, spacing, or component structure.

Apply the following dark mode palette and rules:

- Use layered backgrounds (not pure black):
  background: #0F141A
  content1: #151B22
  content2: #1C2430
  content3 (hover): #242F3D

- Sidebar:
  - Background darker than content1 (#0D1218)
  - Active item uses muted primary background (rgba(76,141,255,0.15))
  - No glow or neon effects

- Tables:
  - Table container on content1
  - Header uses content2
  - Row hover uses content3
  - Use subtle dividers instead of heavy shadows

- Colors:
  - Reduce primary blue saturation in dark mode (#4C8DFF)
  - Chips (status/priority) must use muted semantic colors
  - Text hierarchy must be clearly readable without high contrast

Acceptance criteria:
- Clear visual separation between sidebar, content, and tables
- Dark mode is calm, readable, and comfortable for long usage
- Overall look similar to YouTrack dark, not flashy

----

part 4: Prompt Empty State

Standardize empty states across the app using a single calm pattern.

Rules:
- Use subtle outline icons (no illustrations).
- Title: short, neutral.
- Description: one concise sentence.
- Optional primary action button only if it makes sense.
- No emojis, no heavy colors.

Dark mode:
- Icon and text use muted tones.
- Empty container sits on content1 background.

Examples:
- Tickets list empty:
  Title: "No tickets yet"
  Description: "Create your first ticket to start tracking work."
  Action: "New Ticket"

- Servers list empty:
  Title: "No servers found"
  Description: "Add a server to start monitoring infrastructure."
  Action: "New Server"

Ensure empty states feel calm and professional, similar to YouTrack.

🔹 Prompt Loading / Skeleton (copy dùng ngay)
Replace all loading indicators with skeleton loaders that match the real layout.

Rules:
- Use skeleton blocks instead of spinners.
- Skeleton colors must follow dark mode layers:
  - Base: content1
  - Highlight: content2
- Skeleton size must match actual components (table rows, headers, inputs).

Examples:
- Table loading: render 5–7 skeleton rows.
- Page header loading: skeleton title + skeleton button.
- Detail page loading: skeleton cards instead of empty boxes.

Ensure skeletons feel calm and unobtrusive, consistent with YouTrack dark mode.
