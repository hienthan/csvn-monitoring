import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { Tabs, Tab, Chip, Card, CardBody, Skeleton } from '@heroui/react'
import Breadcrumb from '@/components/Breadcrumb'
import { useServer } from '@/lib/hooks/useServer'
import { PageContainer } from '@/components/PageContainer'

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

  const handleTabChange = (key: React.Key) => {
    const keyStr = String(key)
    if (keyStr === 'overview') {
      navigate(`/servers/${serverId}`)
    } else {
      navigate(`/servers/${serverId}/${keyStr}`)
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
    <PageContainer className="space-y-6 py-6">
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
      <Card shadow="sm" className="border-none bg-content1 overflow-hidden">
        <CardBody className="p-0">
          {loading ? (
            <div className="p-8 space-y-6">
              <Skeleton className="h-10 w-1/3 rounded-xl" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-5 w-24 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden">
              {/* Background Accent - wrapped to prevent overflow */}
              <div className="absolute top-[-64px] right-[-64px] w-32 h-32 bg-primary/5 rounded-full blur-3xl" />

              <div className="p-8 space-y-8 relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                      {server?.name || 'Unknown Server'}
                    </h1>
                    <p className="text-default-500 font-medium flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Infrastructure Node
                    </p>
                  </div>

                  {server?.status && (
                    <Chip
                      size="lg"
                      variant="shadow"
                      color={
                        server.status.toLowerCase() === 'online' ||
                          server.status.toLowerCase() === 'active'
                          ? 'success'
                          : server.status.toLowerCase() === 'offline' ||
                            server.status.toLowerCase() === 'inactive'
                            ? 'danger'
                            : 'default'
                      }
                      className="px-6 py-2 h-auto text-sm font-bold uppercase tracking-wider animate-status-pulse"
                    >
                      {server.status}
                    </Chip>
                  )}
                </div>

                <div className="w-full min-w-0 max-w-full overflow-x-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full">
                    <div className="min-w-0 p-5 rounded-2xl bg-default-50 border border-divider hover:bg-default-100 transition-all shadow-sm">
                      <p className="text-[10px] font-extrabold text-default-400 uppercase tracking-widest mb-1.5 shrink-0">Network Identity</p>
                      <p className="text-lg font-bold font-mono text-primary truncate min-w-0">
                        {server?.ip || server?.host || 'N/A'}
                      </p>
                    </div>

                    <div className="min-w-0 p-5 rounded-2xl bg-default-50 border border-divider hover:bg-default-100 transition-all shadow-sm">
                      <p className="text-[10px] font-extrabold text-default-400 uppercase tracking-widest mb-1.5 shrink-0">Environment</p>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                        <p className="text-lg font-bold text-foreground capitalize truncate min-w-0">
                          {server?.environment || 'Development'}
                        </p>
                      </div>
                    </div>

                    <div className="min-w-0 p-5 rounded-2xl bg-default-50 border border-divider hover:bg-default-100 transition-all shadow-sm">
                      <p className="text-[10px] font-extrabold text-default-400 uppercase tracking-widest mb-1.5 shrink-0">Operating System</p>
                      <p className="text-lg font-bold text-foreground truncate min-w-0">
                        {server?.os || 'Linux Kernel'}
                      </p>
                    </div>

                    <div className="min-w-0 p-5 rounded-2xl bg-default-50 border border-divider hover:bg-default-100 transition-all shadow-sm">
                      <p className="text-[10px] font-extrabold text-default-400 uppercase tracking-widest mb-1.5 shrink-0">Virtualization</p>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${server?.docker_mode ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-default-300'}`} />
                        <p className="text-lg font-bold text-foreground truncate min-w-0">
                          {formatDockerMode(server?.docker_mode)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Tabs */}
      <Tabs
        variant="underlined"
        color="primary"
        selectedKey={getActiveTab()}
        onSelectionChange={(key) => handleTabChange(key as string)}
        aria-label="Server detail tabs"
        classNames={{
          tabList: "gap-6 w-full relative rounded-none border-b border-divider p-0",
          cursor: "w-full bg-primary h-0.5",
          tab: "max-w-fit px-0 h-12",
          tabContent: "group-data-[selected=true]:text-primary font-bold transition-all"
        }}
      >
        <Tab key="overview" title="Overview" />
        <Tab key="apps" title="Apps" />
        <Tab key="ports" title="Ports" />
      </Tabs>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <Outlet />
      </div>
    </PageContainer>
  )
}

export default ServerDetail
