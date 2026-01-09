Prompt 1 — Ticket feature module scaffold + routes + sidebar
Implement the Ticket feature using React + Tailwind + HeroUI + React Router, with PocketBase as backend.

Create folder: src/features/tickets/
- components/
- hooks/
- services/
- pages/
- types.ts
- constants.ts
- utils.ts

Add routes:
- /tickets -> TicketListPage
- /tickets/new -> TicketCreatePage
- /tickets/:ticketId -> TicketDetailPage

Integrate into existing AppShell sidebar:
- Replace the placeholder "Ticket" with real navigation:
  - Tickets (list) -> /tickets
  - New Ticket -> /tickets/new

Do not implement authentication. Use requester_name/requester_contact/actor_name fields.
Ensure `npm run build` passes.

Prompt 2 — Types + constants locked to your schema
Create schema-locked TypeScript types and UI constants for Ticket.

File: src/features/tickets/types.ts
Collections and fields:

tickets:
- code: string (unique)
- title: string
- description: string
- type: one of:
  deploy_bugfix, deploy_feature, new_app_setup, dockerize, env_test_setup, db_migration,
  domain_ssl, ci_cd, monitoring_alert, backup_restore, access_permission
- priority: low | normal | high | urgent
- status: new | triage | in_progress | waiting_dev | blocked | done | rejected
- environment: dev | test | staging | prod (single by default; keep code flexible for multi)
- app_name: string
- service_tags: string[] (multi)
- requester_name: string
- requester_contact?: string
- assignee?: string
- due_at?: string (date ISO)
- started_at?: string (date ISO)
- resolved_at?: string (date ISO)
- attachments?: string[] (PB file field)
- links?: any (json) OR string (text) — implement robustly to support both

ticket_comments:
- ticket: string (relation id)
- author_name: string
- message: string
- attachments?: string[] (PB file field)

ticket_events:
- ticket: string
- event_type: status_changed | priority_changed | assigned | unassigned | type_changed | note
- from_value?: string
- to_value?: string
- actor_name: string
- note?: string

Also create constants.ts:
- label maps for status/priority/type/environment
- chip colorVariant maps for status/priority
- service tag options: docker, mysql, nginx, network, ssl, ci (plus allow free input)

Prompt 3 — PocketBase services (CRUD + file upload + safe parsing links)
Implement PocketBase services for:
- tickets
- ticket_comments
- ticket_events

Files:
- src/features/tickets/services/tickets.service.ts
- src/features/tickets/services/comments.service.ts
- src/features/tickets/services/events.service.ts

Requirements:
1) tickets.service.ts
- listTickets({page, perPage, q, status?, priority?, type?, environment?, assignee?})
  - search q should match title OR code OR app_name OR requester_name
  - sort by updated desc (fallback created desc)
- getTicket(ticketId)
- createTicket(payload, attachmentsFiles?)
  - use FormData for PB file upload when attachments present
- updateTicket(ticketId, payload, attachmentsFiles?)
- changeStatus(ticketId, toStatus, actorName, note?)
  - update ticket.status (+ set started_at/resolved_at when applicable)
  - create ticket_events record event_type=status_changed with from_value/to_value/actor_name/note

2) comments.service.ts
- listComments(ticketId)
  - sort created asc
- addComment({ticket, author_name, message, attachmentsFiles?})
  - after create comment, also create ticket_event event_type=note with actor_name=author_name note="comment_added"
- (optional) deleteComment(commentId) only if allowed; otherwise skip

3) events.service.ts
- listEvents(ticketId) sort created asc
- addEvent(payload)

Robustness:
- Implement a helper to parse links:
  - if links is JSON object/array: keep
  - if links is string: try JSON.parse, else treat as newline-separated URLs
- Centralize PB error normalization: return {message, details}

Prompt 4 — Code generator for ticket.code (TCK-YYYY-######) with uniqueness check
Implement ticket code generation:

Rule:
- code format: TCK-<YEAR>-<6 digits> e.g. TCK-2026-000123

Implementation:
- In TicketCreatePage, on page load generate a provisional code.
- Before createTicket, check uniqueness by querying tickets collection filter: code="<code>"
- If exists, increment number and retry up to 20 times.
- Keep generation in src/features/tickets/utils.ts:
  - generateTicketCode(year, seq)
  - findAvailableTicketCode(pb, year)

Do not rely on PocketBase auto IDs for user-facing code.

Prompt 5 — Hooks (list/detail/comments/events) + URL query sync
Implement hooks:

- useTicketFilters(): read/write URL search params for list filters (q, status, priority, type, environment, page)
- useTickets(): uses filters + pagination; debounced search (400ms); returns {items, totalPages, loading, error, refetch}
- useTicket(ticketId): loads ticket; update; changeStatus
- useTicketComments(ticketId): list + add comment with attachments
- useTicketEvents(ticketId): list

Keep hooks under src/features/tickets/hooks/.
Avoid duplicated fetch logic. Ensure cancellation handling on rapid filter changes.

Prompt 6 — TicketListPage UI (HeroUI Table + filters + chips + row click)
Build TicketListPage (/tickets) using HeroUI components.

Layout:
- Page header: "Tickets" + button "New Ticket"
- Search bar with icon INSIDE input
- Filter row:
  - Status Select
  - Priority Select
  - Type Select
  - Environment Select
  - Clear filters button
- Table columns:
  - Code (monospace + copy button)
  - Title
  - Status (Chip)
  - Priority (Chip)
  - Type
  - Env
  - App (app_name)
  - Assignee
  - Updated (relative)
- Row click -> /tickets/:ticketId
- Loading: Table skeleton
- Empty: EmptyState with CTA "Create first ticket"
- Error: error card + retry

Add pagination control at bottom (HeroUI Pagination).
Ensure compact density and consistent spacing with the rest of the app.

Prompt 7 — TicketCreatePage form (attachments + links editor)
Build TicketCreatePage (/tickets/new) with a clean HeroUI form.

Fields (locked to schema):
- code (read-only, generated)
- title (required)
- description (required, allow markdown text; use Textarea or Editor if available)
- type (required select)
- priority (required select)
- status (default "new", read-only or selectable only for devops? -> keep selectable but default new)
- environment (select, default dev/test; allow multi-ready but start single)
- app_name (text)
- service_tags (multi select or chips input; pre-defined options but allow custom)
- requester_name (required)
- requester_contact (optional)
- assignee (optional)
- due_at (optional date)
- attachments (file input, multiple)
- links (implement as:
   - a repeater UI: "Add link" rows with label + url
   - store as JSON array in links if possible; fallback to stringified JSON)

Behavior:
- Validate required fields
- On submit:
  - create ticket with attachments (FormData)
  - create ticket_event event_type=note actor_name=requester_name note="ticket_created"
  - redirect to /tickets/:id

Provide cancel/back action.

Prompt 8 — TicketDetailPage shell + status transition modal (with started_at/resolved_at logic)
Build TicketDetailPage (/tickets/:ticketId) with:

Header:
- Breadcrumb: Tickets / {code}
- Title + chips (status, priority)
- Right actions:
  - Change Status (Dropdown + confirm Modal)
  - Edit (Modal)
  - Refresh

Tabs (HeroUI Tabs):
- Overview
- Comments
- Events

Status transition rules:
- allow change to any status for now, but show recommended flow:
  new -> triage -> in_progress -> done
  waiting_dev / blocked / rejected as alternatives

On status change:
- If moving to in_progress and started_at is empty -> set started_at = now
- If moving to done or rejected -> set resolved_at = now
- If moving from done/rejected back to in_progress -> do not clear resolved_at automatically; ask in modal "Clear resolved_at?" checkbox default false
- Always create ticket_events:
  event_type=status_changed
  from_value=<old>
  to_value=<new>
  actor_name=<input field in modal default assignee or "DevOps">
  note=<optional>

Implement modal with fields: actor_name (required), note (optional).

Prompt 9 — Overview tab: structured cards + edit modal (diff logging)
Implement Overview tab:

Cards:
1) Summary
- code, type, environment, app_name, service_tags
- requester_name/contact
- assignee
- due_at, started_at, resolved_at

2) Description
- render markdown-like (basic: preserve line breaks; if you add markdown lib, keep lightweight)

3) Links
- display link list; each opens in new tab
- support both JSON array and fallback string list

Edit Ticket:
- "Edit" opens HeroUI Modal with form for:
  title, description, type, priority, environment, app_name, service_tags, requester_name/contact, assignee, due_at, links
- On save:
  - update ticket
  - create ticket_event event_type=note actor_name=<actor input> note="ticket_updated: <changedFields summary>"

Prompt 10 — Comments tab: timeline + attachment upload + “author_name” required
Implement Comments tab:

- Comment composer:
  - author_name (required input; default to requester_name or assignee if available)
  - message textarea (required)
  - attachments file input (multiple)
  - submit button
- Comment list as timeline:
  - author_name + timestamp
  - message
  - attachments list with download/open links using PocketBase file URL

On submit:
- add comment (with attachments via FormData)
- create ticket_event event_type=note
  actor_name=author_name
  from_value/to_value empty
  note="comment_added"

Prompt 11 — Events tab: audit table + human-readable summaries
Implement Events tab:

- Table columns:
  - Time
  - Event Type (Chip)
  - Actor
  - Change (render from_value -> to_value when present)
  - Note

Human-readable mapping:
- status_changed: "Status: <from> → <to>"
- priority_changed: "Priority: <from> → <to>"
- type_changed: "Type: <from> → <to>"
- assigned: "Assigned to <to_value>"
- unassigned: "Unassigned"
- note: show note text

Add filter dropdown by event_type.

Prompt 12 — Attachments file URL helper for PB + UI download links
Implement helper to render PocketBase file links correctly.

Create src/features/tickets/utils.ts:
- pbFileUrl(collectionName, recordId, fileName): string
- pbFilesUrls(collectionName, recordId, fileNames[]): string[]

Use VITE_PB_URL as base.

Apply to:
- tickets.attachments
- ticket_comments.attachments

In UI, show each file as:
- a small row with file icon + filename + open/download action

Prompt 13 — Quality gate: empty/error/loading states + consistent styling
Polish the Ticket module UX:

- Add Skeleton components for:
  - list table loading
  - detail header loading
  - tabs loading
- Add EmptyState component under src/components/EmptyState.tsx and reuse
- Ensure all network errors show:
  - user-friendly message
  - retry button
- Ensure HeroUI component props are consistent across pages (sizes, radius, variants)
- Run through and ensure no TS errors, no unused imports.