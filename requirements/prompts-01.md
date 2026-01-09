You are my coding agent. Create a new React project using Vite (TypeScript) and configure TailwindCSS + HeroUI + React Router.

Prompt 1: — Khởi tạo project + dependency chuẩn
Requirements:
- Vite + React + TypeScript
- TailwindCSS configured (postcss/autoprefixer), global styles in src/styles/globals.css
- Install and configure HeroUI (use HeroUI components for layout primitives where reasonable)
- Add react-router-dom and set up routes
- Add @ alias for src (vite + tsconfig paths)
- Provide exact commands in a README section and ensure the app runs with `npm run dev`.

Deliverables:
- Working codebase with no TS errors
- Basic routing working (Dashboard page renders)
- A clean folder structure (src/app, src/pages, src/components, src/layout, src/lib, src/services, src/types)

Prompt 2 — Dựng layout “AppShell” + Sidebar đúng cây menu
Implement an AppShell layout with:
- Left sidebar (collapsible)
- Top header bar (search input with magnifier icon INSIDE the input on the left, plus right-side action area placeholder)
- Main content area with <Outlet/> for routing

Sidebar navigation structure (tree):
- Dashboard (route: /)
- Servers (route: /servers)
  - Apps (child route: /servers/:serverId/apps) [not standalone top-level]
  - Ports (child route: /servers/:serverId/ports) [not standalone top-level]
- Ticket (route: /tickets) [placeholder page]
- Backup Status (route: /backup) [placeholder page]

Rules:
- Apps and Ports must NOT appear as top-level items; they should appear as contextual items under Servers.
- Visual style: compact, clean, consistent spacing; Tailwind + HeroUI; do not copy Mosaic Lite code—rebuild cleanly.
- Sidebar supports “active” highlight based on current route.
- If sidebar is collapsed, show icons only (placeholders ok).
- Keep components reusable: <Sidebar/>, <Topbar/>, <AppShell/> in src/layout.

Prompt 3 — Routing chuẩn + skeleton pages
Set up react-router-dom routing:

Routes:
- "/" -> DashboardPage
- "/servers" -> ServersPage (table/grid)
- "/servers/:serverId" -> ServerDetailPage (overview)
- "/servers/:serverId/apps" -> ServerAppsPage
- "/servers/:serverId/ports" -> ServerPortsPage
- "/tickets" -> TicketsPage (placeholder)
- "/backup" -> BackupPage (placeholder)
- 404 NotFound page

Requirements:
- Use <AppShell/> as the shared layout for all routes
- Use lazy loading for route pages (React.lazy + Suspense)
- Provide a centralized route config in src/app/routes.tsx
- Add breadcrumb component in Server detail pages (Servers / {name})

Prompt 4 — Tích hợp PocketBase client + config base URL
Add PocketBase integration for direct frontend calls.

Requirements:
- Use env var VITE_PB_URL (default to "http://gmo021.cansportsvg.com:8090")
- Create src/lib/pb.ts exporting a configured PocketBase instance
- Create src/services/* for API wrappers (servers, apps, ports)
- Add src/types/* for TS types
- Ensure all fetching functions support:
  - list with pagination
  - get by id
  - expand relations if needed
- No authentication (assume public access)
- Add error handling (toast placeholder or inline error state)

Implement initial endpoints:
- servers: /api/collections/ma_servers/records
- ports: /api/collections/ma_server_ports/records
- apps: /api/collections/ma_server_apps/records

Note:
- Use the PocketBase JS SDK style rather than raw fetch where possible.

Prompt 5 — ServersPage: HeroUI Table + search + row click
Implement ServersPage using HeroUI Table with custom cells (clean, like modern admin tables).

Requirements:
- Columns: Name, IP/Host, Docker Mode, Environment, OS, Status, Updated
- Remove any old columns like notes/netdata
- Search input in Topbar filters servers by name/host
- Table supports:
  - loading state (skeleton rows)
  - empty state
  - row click navigates to /servers/:serverId
- Use stable UI patterns:
  - left align text, consistent padding
  - status badge (Online/Offline/Unknown)
- Data source:
  - fetch servers from PocketBase (services/servers.ts)
- Keep table logic separate from UI (hook: useServers())

Prompt 6 — ServerDetail: Tabs + nested routes (Overview / Apps / Ports)
Implement ServerDetailPage as a detail shell:

- Top area: Server name + key metadata (host/ip, env, OS, docker mode)
- Tabs:
  - Overview -> /servers/:serverId
  - Apps -> /servers/:serverId/apps
  - Ports -> /servers/:serverId/ports

Requirements:
- Tabs must reflect active route
- Each tab route renders its own component via nested routing
- Overview shows:
  - summary cards (CPU/RAM/Disk/Network placeholders for now)
  - a small “Quick Actions” area (placeholders: Add Ticket, View Backup)
- Apps and Ports pages show tables filtered by serverId using PB filter query

Prompt 7 — Expandable rows (Ports hoặc Apps) theo kiểu bạn đã từng yêu cầu
Add expandable rows to the Ports table (or Apps table) using HeroUI patterns.

Behavior:
- Each row has a chevron icon to expand/collapse
- Expanded content shows:
  - Related app info (expand relation)
  - service name, container name, internal/external port mapping
  - copy-to-clipboard buttons for common values
- Expansion state must be controlled (only one expanded at a time)
- Must be accessible (keyboard navigable) and not break row click navigation (separate click zones)

Prompt 8 — Chuẩn hóa “coding rules” để Cursor không làm loạn UI
Refactor and enforce conventions:

- No inline styles; use Tailwind classes
- Keep components under 200 lines; split into smaller components
- Put all constants in src/lib/constants.ts
- Avoid duplicated fetch logic; use hooks + services
- Add basic linting (eslint) and prettier config
- Ensure consistent spacing and typography across pages
- Verify build passes: `npm run build`