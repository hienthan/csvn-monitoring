import { lazy } from 'react'
import { RouteObject } from 'react-router-dom'
import Layout from '@/layout/Layout'

// Lazy load pages
const DashboardPage = lazy(() => import('@/pages/Dashboard'))
const ServersPage = lazy(() => import('@/pages/Servers'))
const ServerDetailPage = lazy(() => import('@/pages/ServerDetail'))
const ServerOverviewPage = lazy(() => import('@/pages/ServerOverview'))
const ServerAppsPage = lazy(() => import('@/pages/ServerApps'))
const ServerPortsPage = lazy(() => import('@/pages/ServerPorts'))
const TicketListPage = lazy(() => import('@/features/tickets/pages/TicketListPage'))
const TicketCreatePage = lazy(() => import('@/features/tickets/pages/TicketCreatePage'))
const TicketDetailPage = lazy(() => import('@/features/tickets/pages/TicketDetailPage'))
const BackupPage = lazy(() => import('@/pages/BackupStatus'))
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
        path: 'backup',
        element: <BackupPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]

