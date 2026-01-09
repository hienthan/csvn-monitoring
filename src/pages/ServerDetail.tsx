import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { Tabs, Tab, Chip, Card, CardBody, Skeleton } from '@heroui/react'
import Breadcrumb from '@/components/Breadcrumb'
import { useServer } from '@/lib/hooks/useServer'

function ServerDetail() {
  const { serverId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { server, loading } = useServer(serverId)

  const getActiveTab = () => {
    if (location.pathname.includes('/apps')) return 'apps'
    if (location.pathname.includes('/ports')) return 'ports'
    return 'overview'
  }

  const handleTabChange = (key: string) => {
    if (key === 'overview') {
      navigate(`/servers/${serverId}`)
    } else {
      navigate(`/servers/${serverId}/${key}`)
    }
  }

  const formatDockerMode = (mode?: string | boolean) => {
    if (mode === undefined || mode === null) return 'N/A'
    if (typeof mode === 'boolean') {
      return mode ? 'Enabled' : 'Disabled'
    }
    return String(mode)
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Servers', path: '/servers' },
          {
            label: server?.name || `Server ${serverId}`,
            path: `/servers/${serverId}`,
          },
        ]}
      />

      {/* Server Info Header */}
      <Card>
        <CardBody className="p-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-64 rounded" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{server?.name || 'Unknown Server'}</h1>
                {server?.status && (
                  <Chip
                    size="sm"
                    variant="flat"
                    color={
                      server.status.toLowerCase() === 'online' ||
                      server.status.toLowerCase() === 'active'
                        ? 'success'
                        : server.status.toLowerCase() === 'offline' ||
                          server.status.toLowerCase() === 'inactive'
                        ? 'danger'
                        : 'default'
                    }
                  >
                    {server.status}
                  </Chip>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-default-500">IP/Host</p>
                  <p className="font-medium">
                    {server?.ip || server?.host || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-default-500">Environment</p>
                  <p className="font-medium">{server?.environment || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-default-500">OS</p>
                  <p className="font-medium">{server?.os || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-default-500">Docker Mode</p>
                  <p className="font-medium">
                    {formatDockerMode(server?.docker_mode)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Tabs */}
      <Tabs
        selectedKey={getActiveTab()}
        onSelectionChange={(key) => handleTabChange(key as string)}
        aria-label="Server detail tabs"
      >
        <Tab key="overview" title="Overview" />
        <Tab key="apps" title="Apps" />
        <Tab key="ports" title="Ports" />
      </Tabs>

      {/* Tab Content */}
      <Outlet />
    </div>
  )
}

export default ServerDetail
