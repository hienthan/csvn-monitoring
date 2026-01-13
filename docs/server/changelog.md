# Server Feature Changelog - Netdata Integration

## [2024-01-12] Netdata Monitoring System

### Core Integration
- **`useNetdataKpis` Hook**: Custom React hook to manage real-time monitoring state, polling, and metric aggregation.
- **`netdataService`**: Service layer for fetching chart data and active alarms from Netdata agents.
- **Multi-Chart Support**: Implementation of parsers for:
  - `system.cpu`: Overall CPU utilization.
  - `system.ram`: Memory usage (Used vs Free).
  - `system.io`: Disk Read/Write throughput.
  - `system.net`: Network Inbound/Outbound traffic.
  - `mem.swap`: Swap memory monitoring.
  - `alarms`: Active health check alerts.

### Status Intelligence
- **Connection Logic**:
  - **Online**: Successfully receiving metrics with no active alarms.
  - **Degraded**: Agent reachable but server reports active Warning or Critical alerts.
  - **Offline**: Connection failed after multiple consecutive attempts.
- **Auto-Polling**: Intelligent polling with `AbortController` cleanup and automatic interval adjustment based on server state.

### UI/UX Components
- **Server Header Badges**: Dynamic status indicator in `ServerDetailPage` with color-coded pulsing dots.
- **Alarm Badges**: Real-time counters for Critical (Danger) and Warning (Orange) alarms.
- **Dashboard Synchronization**: Integrated Netdata metrics directly into `ServerOverviewPage` with automatic value formatting (scaling units dynamically).
- **Data Freshness**: Implemented cache-busting strategies (`no-store` and timestamped queries) to prevent stale monitoring data.

### Performance & Security
- **Backend Optimization**: Refined PocketBase collection filters to handle `ma_` prefixed namespaces.
- **Memory Management**: Fixed stale closures in monitoring hooks using `useRef` for configuration values.
- **Robust Parsing**: Enhanced chart parsing to handle variable dimensions in Netdata's API response.
