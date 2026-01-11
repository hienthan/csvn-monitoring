ALL-IN-ONE PROMPT — TICKET DASHBOARD (FEATURE-BASED STRUCTURE)

Implement a Ticket Dashboard from scratch using the existing feature-based folder structure.

1. Chart Library

Use Recharts as the only charting library.

Do not assume any existing chart setup.

Charts must be responsive using ResponsiveContainer.

Charts must be rendered inside HeroUI Card components.

2. Folder Structure (DO NOT DEVIATE)
src/
├── features/
│   ├── tickets/
│   │   ├── pages/
│   │   │   └── TicketDashboardPage.tsx
│   │   ├── components/
│   │   │   └── charts/
│   │   │       ├── TicketStatusDonutChart.tsx
│   │   │       ├── TicketsCreatedOverTimeChart.tsx
│   │   │       └── TicketStatusTransitionChart.tsx
│   │   ├── hooks/
│   │   │   └── useTicketDashboardFilters.ts
│   │   ├── services/
│   │   │   └── ticketDashboardService.ts
│   │   ├── utils/
│   │   │   ├── ticketAggregations.ts
│   │   │   └── ticketEventAggregations.ts
│   │   └── types.ts
│   │
│   └── servers/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       └── types.ts
│
├── constants/
│   └── tickets.ts
│
├── components/
│   └── ui/
│       └── EmptyState.tsx
│
└── pages/
    └── Dashboard.tsx

3. Architecture Rules (Mandatory)

Chart components MUST NOT fetch data.

Chart components MUST NOT contain aggregation logic.

All aggregation logic MUST live under:
features/tickets/utils/

Data flow MUST be:
PocketBase → service → aggregation → charts

4. Data Model (STRICT)

tickets

created (timestamp)

status: new | triage | waiting_dev | blocked | done | rejected

ticket_events

ticket (relation → tickets)

created (timestamp)

event_type: note | priority | assigned | unassigned | type_changed | status_changed

For status_changed:

from_status

to_status

ticket_events is the single source of truth for all timeline metrics.

5. Filters

Implement useTicketDashboardFilters() with:

dateRange (from, to)

granularity: day | week | month

Filters apply to:

tickets.created

ticket_events.created

6. Aggregations

Snapshot (from tickets only):

status counts

total tickets

open tickets = new + triage + waiting_dev + blocked

completion rate = done / total

Timeline (from ticket_events only):

Filter event_type = status_changed

Aggregate transitions into each status

Bucket by dateRange + granularity

Do NOT infer timeline status from current ticket state.

7. Charts to Implement

TicketStatusDonutChart

TicketsCreatedOverTimeChart

TicketStatusTransitionChart

Charts receive aggregated data via props only.

8. Guardrails

Do NOT:

Fetch PocketBase data inside chart components

Duplicate ticket history in tickets

Simplify lifecycle logic using current ticket status

Follow strictly:
Raw data → Aggregation → Charts

The implementation must comply with dashboard_context.md.