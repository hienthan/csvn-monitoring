# CSVN Monitoring

A React application built with Vite, TypeScript, TailwindCSS, HeroUI, and React Router.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
VITE_PB_URL=http://127.0.0.1:8090
```

The default PocketBase URL is `http://127.0.0.1:8090` if `VITE_PB_URL` is not set.

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── app/          # App component and routing setup
├── components/   # Reusable React components
├── layout/       # Layout components
├── lib/          # Utility functions and helpers
├── pages/        # Page components
├── services/     # API services and external integrations
├── styles/       # Global styles (TailwindCSS)
└── types/        # TypeScript type definitions
```

## Technologies

- **Vite** - Build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS framework
- **HeroUI** - React component library
- **React Router** - Client-side routing
- **PocketBase** - Backend as a Service (BaaS)

## PocketBase Integration

The project uses PocketBase for data management. The integration includes:

- **Client Configuration**: `src/lib/pb.ts` - Configured PocketBase instance
- **API Services**: `src/services/` - Service wrappers for:
  - `serverService` - Server management (`ma_servers` collection)
  - `portService` - Port management (`ma_server_ports` collection)
  - `appService` - App management (`ma_server_apps` collection)
- **TypeScript Types**: `src/types/` - Type definitions for all entities
- **Error Handling**: `src/lib/errorHandler.ts` - Error handling utilities

### API Services

All services support:
- List with pagination (`list()`)
- Get by ID (`getById()`)
- Filter queries (`getByFilter()`, `getByServerId()`)
- Relation expansion via `expand` parameter

### Example Usage

```typescript
import { serverService } from '@/services/serverService'

// Get list of servers
const servers = await serverService.list({ page: 1, perPage: 20 })

// Get server by ID
const server = await serverService.getById('server-id', 'expand=ports,apps')

// Get servers by filter
const filtered = await serverService.getByFilter('status = "active"')
```

## Path Aliases

The project uses `@` as an alias for the `src` directory. Import examples:

```typescript
import Layout from '@/layout/Layout'
import Dashboard from '@/pages/Dashboard'
```

