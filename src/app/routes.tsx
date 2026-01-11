import { lazy } from 'react'
import { RouteObject } from 'react-router-dom'
import Layout from '@/layout/Layout'

// Lazy load pages
const DashboardPage = lazy(() => import('@/pages/Dashboard'))
const ServersPage = lazy(() => import('@/pages/Servers'))
const ServerCreatePage = lazy(() => import('@/pages/ServerCreatePage'))
const ServerDetailPage = lazy(() => import('@/pages/ServerDetail'))
const ServerOverviewPage = lazy(() => import('@/pages/ServerOverview'))
const ServerAppsPage = lazy(() => import('@/pages/ServerApps'))
const ServerPortsPage = lazy(() => import('@/pages/ServerPorts'))
const TicketListPage = lazy(() => import('@/features/tickets/pages/TicketListPage'))
const TicketCreatePage = lazy(() => import('@/features/tickets/pages/TicketCreatePage'))
const TicketDetailPage = lazy(() => import('@/features/tickets/pages/TicketDetailPage'))
const AppListPage = lazy(() => import('@/pages/AppListPage'))
const AppCreatePage = lazy(() => import('@/pages/AppCreatePage'))
const AppDetailPage = lazy(() => import('@/pages/AppDetailPage'))
const BackupPage = lazy(() => import('@/pages/BackupStatus'))
const ThemePreviewPage = lazy(() => import('@/pages/ThemePreviewPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFound'))

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
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

