ALL-IN-ONE PROMPT — TICKET DASHBOARD (FEATURE-BASED STRUCTURE)

Implement a Ticket Dashboard from scratch using the existing feature-based folder structure.

1. Chart Library

Use Recharts as the only charting library.

Do not assume any existing chart setup.

Charts must be responsive using ResponsiveContainer.

Charts must be rendered inside HeroUI Card components.

2. Folder Structure

dựa theo cấu trúc hiện tại.

3. Architecture Rules (Mandatory)

Chart components MUST NOT fetch data.

Chart components MUST NOT contain aggregation logic.

All aggregation logic MUST live under cấu trúc thư mục hợp lý

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

--
Prompt fix charts
The Recharts axes are not visible because axis line stroke is being set to an invalid SVG color string like "0 0% 6.67%" (missing hsl(...)).
Implement a color normalizer and use it for all Recharts stroke/fill.

Steps

Create features/dashboard/utils/normalizeCssColor.ts:

If value starts with # or rgb( or hsl( or oklch( or oklab(, return as-is.

If it matches the pattern ^\s*\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%\s*$ (e.g. "0 0% 6.67%"), return hsl(${value.trim()}).

Otherwise return the original string.

In your chart theme hook (where you read computed CSS vars), run every token through normalizeCssColor() before returning theme.

Use the normalized theme values in:

XAxis/YAxis tick.fill

axisLine.stroke, tickLine.stroke

CartesianGrid.stroke

Tooltip border/background/text

Acceptance:

In DevTools, axis <line> stroke must be valid like stroke="hsl(0 0% 6.67%)" or rgb(...), never raw "0 0% 6.67%".

Axes are visible in dark mode without hardcoded hex.
----
improve charts
In the status transition chart:

Remove the dashed horizontal grid lines and the vertical dashed line at the right edge by disabling the grid:

Either remove <CartesianGrid ... /> entirely, or set horizontal={false} and vertical={false} (preferred).

Make X-axis date labels compact (e.g. 2026-01-09) and stop them from taking extra height:

Set angle={0} and textAnchor="middle" (no rotation)

Reduce axis height: height={24} (or similar)

Use smaller font + spacing: tick={{ fontSize: 12 }} and tickMargin={6}

Ensure the XAxis uses a formatter that returns YYYY-MM-DD exactly (no time), e.g. tickFormatter={(v) => String(v).slice(0, 10)}

Apply these changes only to this chart and verify the bottom padding is reduced.
