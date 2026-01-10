# Project Context & Key Notes

This file serves as a persistent memory for the context of the CSVN-Monitoring project.

## Technology Stack
- **Frontend**: React (TypeScript), Vite.
- **UI Framework**: HeroUI (formerly NextUI) + Tailwind CSS.
- **Icons**: Lucide React.
- **State/Data**: PocketBase (via `pocketbase` SDK).
- **Routing**: React Router DOM.

## Project Structure
- `src/features`: Contains modular features like `tickets`.
- `src/pages`: Main view components (Servers, Apps, Ports, etc.).
- `src/lib/pb.ts`: PocketBase client configuration.
- `src/services`: API abstraction layer.
- `src/types`: TypeScript definitions.

## Key Business Logic
- **Servers**: Monitoring physical/virtual servers. Status usually tracked via health checks.
- **Apps**: Services running on servers. Linked to a server via `server` field in PocketBase.
- **Ports**: Network port monitoring.
- **Tickets**: Integration with a ticketing system (likely for incident management).

## Development Notes
- **Layout**: Follow the `development-guide.md`.
- **Bilingual**: Supports EN and ZH-TW.
- **Testing**: Manual verification is preferred over automated browser testing for now.

## PocketBase Collections
- `ma_servers`: Server records.
- `ma_server_apps`: Application records (expand `app` for global app templates).
- `ma_server_ports`: Port monitoring configuration.
