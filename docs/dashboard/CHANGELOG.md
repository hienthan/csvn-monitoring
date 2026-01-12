# Ticket Dashboard Changelog

## [2026-01-11] - Initial Implementation & Fixes

### Core Implementation

**Architecture**: PocketBase → service → aggregation → charts (strict separation)

- Charts receive data via props only (no fetching)
- Aggregation logic in `utils/aggregations.ts` (not in components)
- Data sources: `tickets` (snapshot) vs `ticket_events` (timeline)

**Components**:

- `TicketStatusDonutChart`: Status distribution (from tickets)
- `TicketsCreatedOverTimeChart`: Creation trends (from tickets, bucketed by granularity)
- `TicketStatusTransitionChart`: Status transitions (from ticket_events, status_changed only)

**Hooks**:

- `useTicketDashboardFilters()`: Date range + granularity (day/week/month)
- `useDashboard()`: Orchestrates data fetching and aggregation
- `useChartTheme()`: Resolves CSS variables to valid SVG colors

**Services**: `dashboardService.ts` - Fetches tickets and ticket_events from PocketBase

**Utils**: `normalizeCssColor.ts` - Normalizes CSS color values (e.g., `"0 0% 6.67%"` → `"hsl(0 0% 6.67%)"`)

### Critical Fixes Applied

1. **Color Normalization** (`normalizeCssColor.ts`): Fixes invalid SVG colors from CSS variables
2. **Theme Hook** (`useChartTheme.ts`): Resolves CSS vars at runtime, watches for theme changes
3. **Axes Visibility**: All axes use normalized theme colors (not raw CSS vars)
4. **Grid Lines**: Disabled by default (`horizontal={false} vertical={false}`)
5. **X-axis Compact**: `height={24}`, `angle={0}`, `tickMargin={6}`, date formatter

### Chart Styling Pattern (Reuse for Apps/Servers Dashboards)

```typescript
const theme = useChartTheme() // Always use this hook

<LineChart style={{ color: theme.text }}>
  <CartesianGrid stroke={theme.grid} horizontal={false} vertical={false} />
  <XAxis
    tick={{ fill: theme.muted, fontSize: 12 }}
    axisLine={{ stroke: theme.border, strokeWidth: 1 }}
    tickLine={{ stroke: theme.border }}
    tickMargin={6}
    height={24}
    angle={0}
    textAnchor="middle"
    tickFormatter={(v) => String(v).slice(0, 10)} // YYYY-MM-DD
  />
  <YAxis
    tick={{ fill: theme.muted, fontSize: 12 }}
    axisLine={{ stroke: theme.border, strokeWidth: 1 }}
    tickLine={{ stroke: theme.border }}
    tickMargin={6}
  />
  <Tooltip contentStyle={{
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    color: theme.text
  }} />
  <Legend wrapperStyle={{ color: theme.muted }} />
</LineChart>
```

**Theme values**: `text`, `muted`, `grid`, `border`, `surface` (from HeroUI CSS vars)

### Mandatory Rules

- ✅ Use `useChartTheme()` - never raw CSS vars in Recharts
- ✅ Charts receive data via props (no fetching)
- ✅ Aggregation in `utils/`, not components
- ✅ Wrap in `ResponsiveContainer` + `HeroUI Card`
- ✅ Handle empty states

### File Structure

```
features/dashboard/
├── components/     # Chart components (no data fetching)
├── hooks/          # useDashboard, useChartTheme, useTicketDashboardFilters
├── services/       # PocketBase data fetching
├── utils/          # aggregations.ts, normalizeCssColor.ts
└── types.ts        # TypeScript definitions
```
