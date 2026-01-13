import { lazy } from 'react'
import { RouteObject } from 'react-router-dom'
import Layout from '@/layout/Layout'

// Lazy load pages
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const ServersPage = lazy(() => import('@/features/servers/pages/ServerListPage'))
const ServerCreatePage = lazy(() => import('@/features/servers/pages/ServerCreatePage'))
const ServerDetailPage = lazy(() => import('@/features/servers/pages/ServerDetailPage'))
const ServerOverviewPage = lazy(() => import('@/features/servers/pages/ServerOverviewPage'))
const ServerAppsPage = lazy(() => import('@/features/servers/pages/ServerAppsPage'))
const ServerPortsPage = lazy(() => import('@/features/servers/pages/ServerPortsPage'))
const TicketListPage = lazy(() => import('@/features/tickets/pages/TicketListPage'))
const TicketCreatePage = lazy(() => import('@/features/tickets/pages/TicketCreatePage'))
const TicketDetailPage = lazy(() => import('@/features/tickets/pages/TicketDetailPage'))
const AppListPage = lazy(() => import('@/features/apps/pages/AppListPage'))
const AppCreatePage = lazy(() => import('@/features/apps/pages/AppCreatePage'))
const AppDetailPage = lazy(() => import('@/features/apps/pages/AppDetailPage'))
const BackupPage = lazy(() => import('@/features/backup/pages/BackupStatusPage'))
const ThemePreviewPage = lazy(() => import('@/pages/ThemePreviewPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFound'))
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'servers',
        element: <ServersPage />,
      },
      {
        path: 'servers/new',
        element: <ServerCreatePage />,
      },
      {
        path: 'servers/:serverId',
        element: <ServerDetailPage />,
        children: [
          {
            index: true,
            element: <ServerOverviewPage />,
          },
          {
            path: 'apps',
            element: <ServerAppsPage />,
          },
          {
            path: 'ports',
            element: <ServerPortsPage />,
          },
        ],
      },
      {
        path: 'tickets',
        element: <TicketListPage />,
      },
      {
        path: 'tickets/new',
        element: <TicketCreatePage />,
      },
      {
        path: 'tickets/:ticketId',
        element: <TicketDetailPage />,
      },
      {
        path: 'tickets/:ticketId/comments',
        element: <TicketDetailPage />,
      },
      {
        path: 'tickets/:ticketId/events',
        element: <TicketDetailPage />,
      },
      {
        path: 'apps',
        element: <AppListPage />,
      },
      {
        path: 'apps/new',
        element: <AppCreatePage />,
      },
      {
        path: 'apps/:appId',
        element: <AppDetailPage />,
      },
      {
        path: 'backup',
        element: <BackupPage />,
      },
      {
        path: 'theme-preview',
        element: <ThemePreviewPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]

