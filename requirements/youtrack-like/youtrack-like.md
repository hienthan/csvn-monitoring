You are refactoring ONLY Tickets UI in an existing React + TS app using HeroUI v2.0.0 + Tailwind.
Do NOT touch Servers pages or global layout.
Keep routes unchanged: /tickets and /tickets/:id. DO NOT implement split view.

You MUST work within existing file structure and reuse current hooks/services:
- TicketListPage.tsx uses useTickets(filters) + useTicketFilters()
- TicketDetailPage.tsx uses useTicket(ticketId) and existing modals.
- Child components already exist and should be reused (do not delete):
  TicketOverviewTab, TicketCommentsTab, TicketEventsTab, StatusChangeModal, TicketEditModal.

Primary goal: make the Tickets list + detail feel like a modern issue tracker (YouTrack-like):
- tighter density (compact rows, less whitespace)
- clear hierarchy (header -> toolbar -> content)
- consistent chips/badges
- actions consolidated (kebab menu, not many icons)
- sticky toolbar where appropriate
- controlled Select everywhere (selectedKeys Set, correct value/label mapping)
- fix common clickability/pointer-events/z-index issues for header actions.

====================================================================================================
A) TicketListPage.tsx — redesign layout to a compact issue-tracker list

CURRENT: header + a Card with search + 5 Select filters + table card + pagination.
TARGET: same structure but more compact and professional.

1) Page wrapper
- Keep the page simple and not too wide. Use:
  <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-4">
- Reduce vertical whitespace (space-y-6 -> space-y-4).

2) Header row
- Left: "Tickets" title (text-2xl font-semibold) + small subtitle under it:
  - show count summary: if loading show Skeleton, else “{tickets.length} tickets” or if API provides total use that.
  - show active filter summary in a muted line (e.g., “Status: Waiting Dev · Priority: High”).
- Right: "New Ticket" Button remains on this page (do not move to global header). Use HeroUI <Button color="primary" startContent={<Plus size={16} />}>New Ticket</Button>
- Align header row with flex: justify-between, items-start.

3) Toolbar card (sticky under page header)
- Replace the current “Search & Filters Card” with a compact toolbar that is sticky within page scroll:
  - Use a <Card> with <CardBody className="py-3">.
  - Add class: "sticky top-0 z-20 backdrop-blur bg-background/80" on a wrapper div for the toolbar (NOT on the card itself if HeroUI conflicts).
- Layout inside toolbar:
  Row 1 (single compact row on desktop, wraps on small screens):
   - Search Input (HeroUI Input) with startContent <Search size={16} /> and placeholder “Search tickets…”
   - Four compact Selects: Status, Priority, Type, Environment
     - Make them compact: size="sm" (if supported), className max-w, and do not let them stretch full width.
   - A Clear filters button only appears when any filter active:
     Button variant="light" startContent={<X size={16} />} -> calls clearFilters().
- Remove the existing extra wide spacing. Use:
  <div className="flex flex-wrap gap-2 items-center">
- Controlled Select rules:
  - selectedKeys MUST be a Set.
  - Convert filter string or undefined to Set:
    selectedKeys={filters.status ? new Set([filters.status]) : new Set([])}
  - onSelectionChange must read the first key and call setFilter('status', value or undefined).
  - Labels use the existing *_LABELS maps; stored value uses raw enum (new/triage/...).
- Below toolbar row, render “active filter chips” (small removable chips):
  - For each active filter, show <Chip size="sm" variant="flat" onClose={() => setFilter(..., undefined)}>
    Example label: “Status: Waiting Dev”
  - Chips appear only if there is at least 1 active filter.
This matches issue tracker UX and reduces clutter.

4) Table card
- Keep HeroUI Table but adjust density:
  - Use classNames on Table to reduce padding if possible.
  - Use smaller typography for table header: "text-xs uppercase tracking-wide text-foreground-500".
  - Rows: compact: avoid tall cells; keep consistent vertical align.
- Column behavior:
  CODE:
   - Keep copy-to-clipboard icon but make it subtle and only visible on hover of row.
   - The copied check icon appears for the last copied row (copiedCode).
   - Ensure clicking copy does NOT trigger row navigation: stopPropagation.
  TITLE:
   - Primary: title (font-medium), 1 line clamp
   - Secondary: app_name + service_tags (render tags as tiny chips or muted text). Example:
     "frontend-app · docker, ci_cd" with service_tags array joined.
  PRIORITY + STATUS:
   - Use <Chip size="sm" className="capitalize"> with getTicketPriorityColor/getTicketStatusColor.
   - Ensure label uses maps (TICKET_PRIORITY_LABELS / TICKET_STATUS_LABELS).
  ASSIGNEE:
   - Show UserIcon in a small avatar circle + assignee text.
  UPDATED:
   - Use existing formatRelativeTime(updated) for display.
   - Tooltip shows exact timestamp (new Date(updated).toLocaleString()).
  ACTIONS:
   - Replace Eye/Edit/Trash icons with a kebab dropdown per row:
     Use HeroUI Dropdown: Trigger is an icon button (MoreVertical).
     Menu items:
       - View (navigate(`/tickets/${ticket.id}`))
       - Edit (open TicketEditModal for this row)
       - Delete (confirm dialog; call existing deletion handler if any; if not implemented, leave as TODO but wire UI)
   - The kebab button must stopPropagation to avoid row click.
- Row click:
  - clicking row navigates to /tickets/:id.
  - ensure interactive elements stopPropagation.

5) Edit modal support from list page
- Currently TicketListPage has action icons; now actions are kebab.
- Implement local state:
  const [editTicket, setEditTicket] = useState<Ticket | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
- When "Edit" menu item clicked: setEditTicket(ticket); setEditModalOpen(true)
- Render <TicketEditModal isOpen={editModalOpen} onClose=... ticket={editTicket} onSave=... />
- On save success: close modal and refetch().

6) Pagination
- Keep as-is but reduce vertical spacing.
- Ensure Pagination is centered and not too large (size="sm" if supported).

7) Visual polish checklist
- Reduce large whitespace, tighten to professional density.
- Keep consistent icon sizes (16).
- Ensure the toolbar and table fit the overall width (max 1200).

====================================================================================================
B) TicketDetailPage.tsx — keep existing 3 tabs but make header + actions YouTrack-like, plus sticky header

CURRENT: Breadcrumb + header card with status select + actions, then Tabs card.
TARGET: same concept but improved hierarchy, spacing, and interaction correctness.

1) Page container
- Keep max-w 1100 but reduce spacing:
  <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-4">

2) Breadcrumb row
- Keep Back button + Breadcrumb component.
- Ensure back button uses variant="light" and icon size 16.

3) Sticky ticket header
- Replace “Ticket Info Header Card” with a header block that can stick to top of content:
  Wrap in a div with: className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-divider"
  Inside: a Card is optional; prefer a simple div to avoid Card shadow while sticky.
- Layout:
  Left side:
   - Title (text-2xl font-semibold)
   - Under title: a row of chips: Status, Priority, Environment, Type
     - Use Chip size="sm" variant="flat"
     - Status and Priority color from existing functions
     - Environment and Type use neutral chips
  Right side actions (single line, aligned top):
   - Change Status button (NOT a Select in the header; make it a button to open StatusChangeModal):
     Button variant="flat" startContent icon; label “Change status”
     This avoids controlled select issues and matches issue trackers.
   - Edit button: opens TicketEditModal
   - Refresh icon button
   - More dropdown (kebab) with items:
     - Copy ticket link (use navigator.clipboard.writeText(window.location.href))
     - Copy code (copyTicketCode(ticket.code))
     - Duplicate (placeholder / disabled)
- IMPORTANT: ensure these buttons are always clickable:
  - no overlay with pointer-events none/auto issues
  - set z-index and avoid absolute elements covering them
  - if you use Tabs below, ensure sticky header sits above (z-20).

4) Tabs area (keep existing 3 tabs)
- Keep Tabs with Overview/Comments/Events exactly, reusing:
  TicketOverviewTab, TicketCommentsTab, TicketEventsTab.
- Improve Tabs card density:
  - CardBody padding: "p-0" and put Tabs inside with className for padding.
  - Ensure tab panels have consistent padding (e.g., px-6 py-5).
- Do NOT merge activity streams now (because you want 15(A) keep the 2-col Overview and existing tabs).
  Only polish: typography + spacing, consistent headings if needed inside child components (optional).

5) Status change flow (modal)
- Header should NOT use Select for status. Use a button that opens StatusChangeModal.
- Implement:
  - on click Change Status: setSelectedNewStatus(ticket.status) and open modal.
  - StatusChangeModal should receive:
    currentStatus=ticket.status
    newStatus=selectedNewStatus
    assignee=ticket.assignee
    hasResolvedAt=Boolean(ticket.resolved_at)
- Ensure the modal’s internal Select is controlled:
  selectedKeys={newStatus ? new Set([newStatus]) : new Set([])}
  onSelectionChange => setSelectedNewStatus(nextStatus)
- On confirm:
  - setIsChangingStatus(true)
  - call changeStatus(nextStatus) from useTicket hook
  - addEvent(...) via events.service if you already do; ensure it logs from/to/actor
  - optimistic UI: immediately update chips to new status once changeStatus resolves; refetch if needed.
  - close modal.

6) Edit modal
- Keep TicketEditModal and open from header.
- On save: call update(payload); close; refetch.

====================================================================================================
C) Minimal shared polish (optional, only if easy)
- Add a small helper in tickets/utils or constants to humanize labels consistently:
  label maps already exist; just ensure every UI uses them.
- Ensure chips for status/priority are consistent between list and detail.

====================================================================================================
Acceptance criteria (must verify manually after changes)
1) Ticket list toolbar is a single compact row, wraps nicely on small screens, and does NOT have huge whitespace.
2) Filter Selects are controlled and always show correct selected state.
3) Clicking copy icon or kebab menu does NOT navigate row.
4) Row click navigates reliably to /tickets/:id.
5) Detail header is sticky; actions clickable; Change Status opens modal; status updates reflect immediately.
6) Tabs still function; existing child components still render and were not deleted.
7) No changes to Servers pages.

Proceed with implementation now and provide the code diff in the files above.
