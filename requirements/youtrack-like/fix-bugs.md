Prompt (apply ngay)

Create a shared PageContainer and wrap ALL pages (Servers list/details, Tickets list/details/new, Apps tab, Ports tab):

Use: w-full max-w-6xl mx-auto px-6 lg:px-8 min-w-0

Ensure all pages have identical content width and no horizontal overflow.

Apply HeroUI theming + dark mode:

Wrap app root with HeroUI provider + next-themes (darkMode: "class", enableSystem: true).

Use bg-background text-foreground on the app shell.

Add a light/dark toggle in the top-right header.

Fix sidebar active state bug:

Tickets list item active only on /tickets (use NavLink end).

New Ticket active only on /tickets/new.

Remove any manual “selected” state.

Ports tab:

Remove expandable rows completely.

Render a clean HeroUI Table inside the Ports tab panel only.

Apps + Ports tabs UI:

Wrap tab content in Card.

Use HeroUI Table with subtle header background and Chip for status.

Apply the same visual style to both tabs for consistency.

Acceptance: All pages share the same 6xl width, clean light/dark theme, correct sidebar highlight, no expand rows, cohesive Apps/Ports tabs.