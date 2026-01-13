Dashboard Context — Ticket Monitoring (DevOps Internal Tool)
1. Purpose

This dashboard provides operational visibility into DevOps tickets:

Workload volume

Bottlenecks

Status transitions

Completion efficiency

It is designed for real-life DevOps operations, not for cosmetic reporting.

2. Data Sources & Responsibilities
2.1 tickets collection — Current State

The tickets collection represents the current snapshot of each ticket.

Fields in scope:

created (timestamp)

status:
new | triage | waiting_dev | blocked | done | rejected

Rules:

tickets MUST ONLY be used for:

Snapshot metrics

Current status distribution

KPI cards (total, open, done, blocked, rejected)

tickets MUST NOT be used to infer historical status over time.

2.2 ticket_events collection — Historical Truth

The ticket_events collection is the single source of truth for all historical and timeline-based metrics.

Relevant fields:

ticket (relation → tickets)

created (timestamp)

event_type:
note | priority | assigned | unassigned | type_changed | status_changed

For status_changed events:

from_status

to_status

Rules:

All timeline charts (status transitions, lead time, aging) MUST be derived from ticket_events.

No assumptions about status continuity are allowed without events.

Never reconstruct history from the current ticket state.

3. Status Definitions

Canonical statuses:

new

triage

waiting_dev

blocked

done

rejected

Business groupings:

Open / Pending: new, triage, waiting_dev, blocked

Completed: done

Closed (Not Completed): rejected

4. Dashboard Filters

Shared filters for the Ticket Dashboard:

dateRange (from, to)

granularity: day | week | month

Filter behavior:

dateRange applies to:

tickets.created (snapshot & creation trends)

ticket_events.created (timeline & transitions)

Granularity affects all time-bucketed charts.

5. Supported Metrics (Current Scope)
5.1 Snapshot Metrics (from tickets)

Total tickets

Open tickets

Done tickets

Rejected tickets

Blocked tickets

Completion rate

Closure rate

5.2 Timeline Metrics (from ticket_events)

Tickets created over time

Status transitions over time

Lead time (created → done)

Aging of open tickets

6. Architectural Principles (Non-Negotiable)

Charts NEVER fetch raw data.

Charts ONLY receive aggregated data via props.

All aggregation logic lives outside UI components.

ticket_events is mandatory for any time-based or lifecycle metric.

No duplicated status history inside tickets.

7. Current Scope & Future Expansion

Current:

Ticket dashboard only.

Planned:

App dashboard

Server dashboard

Cross-linking tickets → apps / servers

Design must remain backward-compatible.

8. Design Intent

This dashboard prioritizes:

Accuracy over simplicity

Operational truth over visual shortcuts

Long-term maintainability