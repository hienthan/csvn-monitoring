import { useState } from 'react'
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { Tabs, Tab, Chip, Card, CardBody, Skeleton, Button } from '@heroui/react'
import { Edit, Package, AlertTriangle, Info, Trash2 } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { useServer } from '../hooks/useServer'
import { useServerApps } from '../hooks/useServerApps'
import { useApiError } from '@/lib/hooks/useApiError'
import { PageContainer } from '@/components/PageContainer'
import { ServerEditModal } from '@/components/ServerEditModal'
import { useNetdataKpis } from '../hooks/useNetdataKpis'
import { useAuth } from '@/features/auth/context/AuthContext'
import { pb } from '@/lib/pb'
import { isAdmin } from '@/constants/admin'
import type { Server } from '../types'

function ServerDetailPage() {
  const { serverId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { server, loading, refetch, update } = useServer(serverId)
  const { apps } = useServerApps(serverId)
  const { handleError } = useApiError()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { user } = useAuth()
  const canManageServers = isAdmin(user)
  // Only fetch netdata if server has it enabled
  const netdata = useNetdataKpis(
    server?.ip,
    !loading && !!server?.ip && !!server?.is_netdata_enabled
  )

  const getActiveTab = () => {
    if (location.pathname.includes('/apps')) return 'apps'
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

  const handleEditSave = async (payload: Partial<Server>) => {
    if (!server) return
    try {
      await update(payload)
      await refetch()
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const handleDelete = async () => {
    if (!server || !window.confirm('Are you sure you want to delete this server? This action cannot be undone.')) return
    
    setDeleting(true)
    try {
      await pb.collection('ma_servers').delete(server.id)
      navigate('/servers')
    } catch (err) {
      handleError(err)
    } finally {
      setDeleting(false)
    }
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
              <Skeleton className="h-10 w-1/3 rounded bg-content1" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-16 rounded bg-content1" />
                    <Skeleton className="h-5 w-24 rounded bg-content1" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden">
              {/* Background Accent */}
              <div className="absolute top-[-64px] right-[-64px] w-32 h-32 bg-primary/5 rounded-full blur-3xl" />

              <div className="p-8 space-y-8 relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-col">
                      <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                        {server?.name || 'Unknown Server'}
                      </h1>
                      <span className="text-xs text-default-400 font-bold opacity-80 mt-1 capitalize leading-tight">
                        {server?.environment || (server as any).env || 'Production'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                      <p className="text-default-500 font-medium flex items-center gap-2 shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Infrastructure Node
                      </p>

                      {/* Running Apps Badge */}
                      <div className="flex items-center gap-2 bg-default-100 px-3 py-1 rounded-full border border-divider shadow-sm group hover:bg-default-200 transition-all cursor-default">
                        <Package size={14} className="text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black text-default-700">
                          {apps.filter(a => a.status?.toLowerCase() === 'online' || a.status?.toLowerCase() === 'running').length} running apps
                        </span>
                      </div>

                      {/* Netdata Status Line */}
                      {server?.ip && (
                        <div className="flex items-center gap-3 border-l border-divider pl-4 transition-all animate-in fade-in duration-500">
                          <div className="flex items-center gap-1.5">
                            <div className={`h-2 w-2 rounded-full ${netdata.status === 'Online' ? 'bg-success shadow-[0_0_8px_rgba(23,201,100,0.4)]' :
                              netdata.status === 'Degraded' ? 'bg-warning shadow-[0_0_8px_rgba(245,165,36,0.4)]' :
                                'bg-danger shadow-[0_0_8px_rgba(243,18,96,0.4)]'
                              } animate-pulse`} />
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${netdata.status === 'Online' ? 'text-success' :
                              netdata.status === 'Degraded' ? 'text-warning' : 'text-danger'
                            }`}>
                              Netdata: {netdata.status}
                            </span>
                          </div>
                          {netdata.lastUpdated && (
                            <span className="text-[10px] text-default-400 font-medium whitespace-nowrap">
                              Update: {netdata.lastUpdated}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Netdata Alarm Badges */}
                    {server?.ip && (
                      <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-500">
                        <Chip
                          size="sm"
                          color={netdata.alarms.critical > 0 ? "danger" : "default"}
                          variant="flat"
                          startContent={<AlertTriangle size={12} />}
                          className={`font-bold border ${netdata.alarms.critical > 0 ? 'border-danger/20' : 'border-divider/20'}`}
                        >
                          Critical: {netdata.alarms.critical}
                        </Chip>
                        <Chip
                          size="sm"
                          color={netdata.alarms.warning > 0 ? "warning" : "default"}
                          variant="flat"
                          startContent={<Info size={12} />}
                          className={`font-bold border ${netdata.alarms.warning > 0 ? 'border-warning/20' : 'border-divider/20'}`}
                        >
                          Warning: {netdata.alarms.warning}
                        </Chip>
                      </div>
                    )}

                    <Button
                      variant="flat"
                      color="danger"
                      startContent={<Trash2 size={16} />}
                      onPress={handleDelete}
                      isLoading={deleting}
                      isDisabled={!canManageServers}
                      className="font-bold"
                    >
                      Delete
                    </Button>
                    <Button
                      variant="solid"
                      color="primary"
                      startContent={<Edit size={16} />}
                      onPress={() => setEditModalOpen(true)}
                      isDisabled={!canManageServers}
                      className="font-bold"
                    >
                      Edit
                    </Button>
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
          tabList: "gap-8 w-full relative rounded-none border-b border-divider p-0 h-12",
          cursor: "w-full bg-primary h-[2px]",
          tab: "min-w-fit px-0 h-12 transition-all",
          tabContent: "group-data-[selected=true]:text-primary group-data-[selected=true]:font-bold text-default-500 font-medium transition-all text-sm"
        }}
      >
        <Tab key="overview" title="Overview" />
        <Tab key="apps" title="Applications" />
      </Tabs>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <Outlet context={{ netdata, server }} />
      </div>

      {server && (
        <ServerEditModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          server={server}
          onSave={handleEditSave}
        />
      )}
    </PageContainer>
  )
}

export default ServerDetailPage
