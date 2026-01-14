PROMPT: Implement Dashboard v1 – Infrastructure Charts (Netdata-based)

Context

Internal monitoring app

Multiple servers, each server = 1 Netdata host

Some servers do NOT have Netdata → must handle gracefully

Main server is primary focus

Servers list from ma_servers (field: ip)

Netdata API used:
/api/v1/data?chart=...
Charts: system.cpu, system.ram, system.load, system.net, system.io, mem.swap

Fetch interval: 15s

Time range: last 24h

Chart lib: Recharts

UI lib: HeroUI v2

Dashboard is read-only

No realtime streaming, no export

1. Dashboard Structure

Implement Dashboard → Tabs

Infrastructure

Operations (already exists, do not touch)

All new work is ONLY inside Infrastructure tab.

2. Data Handling Rules (IMPORTANT)

Each server has its own Netdata base URL: http://{server.ip}:19999

Only fetch Netdata data for servers where Netdata is reachable

If Netdata is unavailable:

Mark server as No monitoring data

Exclude from aggregate charts

Use cache per server (in-memory state)

Cache key = serverId + chart + timeRange

When switching server dropdown → reuse cached data, do not refetch unless expired

Auto refresh data every 15 seconds

3. Charts to Implement (EXACT LIST)
A. Global Overview (aggregate – all servers with Netdata)

Charts (line, 24h):

Avg CPU Usage (%)
→ system.cpu (average across servers)

Avg Memory Used (%)
→ system.ram

Total Network Traffic (In / Out)
→ system.net (sum across servers)

Total Disk IO (Read / Write)
→ system.io (sum across servers)

Aggregation logic:

Avg = mean of latest values

Total = sum of latest values

Exclude servers without Netdata

B. Top Problematic Servers (ranking)

Charts (bar, snapshot latest):
5. Top 5 Servers by CPU Usage
6. Top 5 Servers by Memory Usage

Rules:

Use latest datapoint only

If less than 5 servers → show available ones

Label bars with server name or IP

C. Focus Server (single server view)

UI control

HeroUI Select (single-select)

Default selected server = main server

Only servers with Netdata appear in dropdown

Charts (line, 24h):
7. CPU Usage (selected server) → system.cpu
8. Memory Used vs Free (stacked) → system.ram
9. Network In / Out → system.net
10. Disk IO Read / Write → system.io
11. Swap Used (if exists) → mem.swap

If swap = 0 → hide chart or show “Swap not used”

4. Alert Summary (Infrastructure – lightweight)

Use Netdata alerts already available (do not refetch separately).

Display:

HeroUI Chip / Badge for:

Critical alerts count

Warning alerts count

Rules:

If count = 0 → still render with 0

Clicking alert count → navigate to Server Detail page

5. UI / Layout Rules

Use HeroUI Card for each chart block

Layout priority:

Global Overview (top)

Top Servers (middle)

Focus Server (bottom)

Do NOT:

Render one chart per server

Compare multiple servers in one line chart

Auto-rotate servers

Charts must be readable on desktop first

Empty / no-data states must be explicit and clean

6. Server List Page (DO NOT ADD CHARTS)

No charts in Server List

Only numeric indicators + alert badges (already or later)

7. Code Quality Expectations

Centralize Netdata fetching logic (service / hook)

Chart components must be reusable

No hardcoded server IDs or IPs

Clear separation:

data fetching

aggregation logic

presentation

Deliverable

Fully working Infrastructure tab

No placeholder charts

No TODO comments left

Must compile and render without runtime warnings