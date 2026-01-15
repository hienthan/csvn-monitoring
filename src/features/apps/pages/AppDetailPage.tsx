import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Chip,
  Card,
  CardBody,
  Button,
  Skeleton,
  Switch,
} from '@heroui/react'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { pb } from '@/lib/pb'
import Breadcrumb from '@/components/Breadcrumb'
import { useApp } from '../hooks/useApp'
import { useApiError } from '@/lib/hooks/useApiError'
import { PageContainer } from '@/components/PageContainer'
import { AppEditModal } from '@/components/AppEditModal'
import type { ServerApp } from '../types'

function AppDetailPage() {
  const { appId } = useParams()
  const navigate = useNavigate()
  const { app, loading, error, refetch, update } = useApp(appId)
  const { handleError } = useApiError()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleEditSave = async (payload: Partial<ServerApp>) => {
    if (!app) return
    try {
      await update(payload)
      await refetch()
    } catch (err) {
      handleError(err)
      throw err
    }
  }

  const handleDelete = async () => {
    if (!app || !window.confirm('Are you sure you want to delete this app? This action cannot be undone.')) return
    
    setDeleting(true)
    try {
      await pb.collection('ma_apps').delete(app.id)
      navigate('/apps')
    } catch (err) {
      handleError(err)
    } finally {
      setDeleting(false)
    }
  }

  if (error) {
    return (
      <PageContainer className="py-8">
        <Card>
          <CardBody className="p-6">
            <div className="text-center space-y-4 py-8">
              <p className="text-danger">Error loading app: {error.message}</p>
              <Button color="primary" onPress={() => navigate('/apps')}>
                Back to Apps
              </Button>
            </div>
          </CardBody>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="py-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              variant="flat"
              onPress={() => navigate('/apps')}
              aria-label="Back to apps"
              size="sm"
            >
              <ArrowLeft size={16} />
            </Button>
            <Breadcrumb
              items={[
                { label: 'Apps', path: '/apps' },
                {
                  label: app?.name || `App ${appId}`,
                  path: `/apps/${appId}`,
                },
              ]}
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              {loading ? <Skeleton className="h-9 w-64 rounded bg-content1" /> : (app?.name || 'Unknown App')}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {loading ? (
                <>
                  <Skeleton className="h-6 w-20 rounded bg-content1" />
                  <Skeleton className="h-6 w-24 rounded bg-content1" />
                </>
              ) : (
                <>
                  {app?.status && (
                    <Chip
                      size="sm"
                      variant="shadow"
                      color={
                        app.status.toLowerCase() === 'online' || app.status.toLowerCase() === 'running'
                          ? 'success'
                          : app.status.toLowerCase() === 'offline' || app.status.toLowerCase() === 'stopped'
                          ? 'danger'
                          : 'default'
                      }
                      className="font-bold uppercase tracking-wider capitalize"
                    >
                      {app.status}
                    </Chip>
                  )}
                  {app?.environment && (
                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        app.environment.toLowerCase() === 'dev' || app.environment.toLowerCase() === 'development'
                          ? 'primary'
                          : app.environment.toLowerCase() === 'stg' || app.environment.toLowerCase() === 'staging'
                          ? 'warning'
                          : app.environment.toLowerCase() === 'prd' || app.environment.toLowerCase() === 'production'
                          ? 'success'
                          : 'default'
                      }
                      className="font-semibold capitalize"
                    >
                      {app.environment}
                    </Chip>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="flat"
            color="danger"
            startContent={<Trash2 size={16} />}
            onPress={handleDelete}
            isLoading={deleting}
            isDisabled={loading || deleting}
            className="font-bold"
          >
            Delete
          </Button>
          <Button
            variant="flat"
            startContent={<Edit size={16} />}
            onPress={() => setEditModalOpen(true)}
            isDisabled={loading}
            className="font-semibold"
          >
            Edit
          </Button>
        </div>
      </div>

      <Card shadow="none" className="border border-divider bg-content1/50 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <CardBody className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
            {/* Notes (top, 2 columns) */}
            <div className="lg:col-span-2 h-full">
              <Card shadow="none" className="border border-divider bg-content1 h-full">
                <CardBody className="h-full flex flex-col">
                  <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-3">Notes</p>
                  <p className="text-sm whitespace-pre-wrap text-default-600">
                    {app?.notes || 'N/A'}
                  </p>
                </CardBody>
              </Card>
            </div>

            {/* Basic Information */}
            <div className="lg:col-span-2 h-full">
              <Card shadow="none" className="border border-divider bg-content1 h-full">
                <CardBody>
                  <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-3">Basic Information</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-1">App Key</p>
                      <p className="text-sm font-mono text-primary font-bold">{app?.key || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-1">Name</p>
                      <p className="text-sm font-semibold">{app?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-1">Department</p>
                      <p className="text-sm">{app?.department || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-1">Owner</p>
                      <p className="text-sm">{app?.created_by || 'System'}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Server & Network */}
            <div className="lg:col-span-2">
              <Card shadow="none" className="border border-divider bg-content1">
                <CardBody>
                  <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-3">Server & Network</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-1">Server</p>
                      {app?.expand?.server ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground">
                            {app.expand.server.name || 'N/A'}
                          </span>
                          <a
                            href={`/servers/${app.expand!.server!.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-primary font-mono mt-0.5 hover:underline"
                          >
                            {app.expand.server.ip || app.expand.server.host || ''}
                          </a>
                        </div>
                      ) : (
                        <p className="text-sm text-default-500">N/A</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-1">Port</p>
                      <p className="text-sm font-mono">{app?.port || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-1">Environment</p>
                      {app?.environment ? (
                        <Chip
                          size="sm"
                          variant="flat"
                          color={
                            app.environment.toLowerCase() === 'dev' || app.environment.toLowerCase() === 'development'
                              ? 'primary'
                              : app.environment.toLowerCase() === 'stg' || app.environment.toLowerCase() === 'staging'
                              ? 'warning'
                              : app.environment.toLowerCase() === 'prd' || app.environment.toLowerCase() === 'production'
                              ? 'success'
                              : 'default'
                          }
                          className="capitalize"
                        >
                          {app.environment}
                        </Chip>
                      ) : (
                        <p className="text-sm text-default-500">N/A</p>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Application Details */}
            <div className="lg:col-span-2">
              <Card shadow="none" className="border border-divider bg-content1">
                <CardBody>
                  <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-3">Application Details</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-1">Tech Stack</p>
                      <p className="text-sm">{app?.tech_stack || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-1">Docker Mode</p>
                      {app?.docker_mode ? (
                        <Chip
                          size="sm"
                          variant="flat"
                          color={
                            app.docker_mode === 'cli' || app.docker_mode === true
                              ? 'primary'
                              : app.docker_mode === 'desktop'
                              ? 'secondary'
                              : 'default'
                          }
                          className="capitalize"
                        >
                          {typeof app.docker_mode === 'string' ? app.docker_mode.toUpperCase() : 'CLI'}
                        </Chip>
                      ) : (
                        <Chip size="sm" variant="flat" color="default">
                          None
                        </Chip>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-1">Status</p>
                      {app?.status ? (
                        <Chip
                          size="sm"
                          variant="flat"
                          color={
                            app.status.toLowerCase() === 'online' || app.status.toLowerCase() === 'running'
                              ? 'success'
                              : app.status.toLowerCase() === 'offline' || app.status.toLowerCase() === 'stopped'
                              ? 'danger'
                              : 'default'
                          }
                          className="capitalize"
                        >
                          {app.status}
                        </Chip>
                      ) : (
                        <p className="text-sm text-default-500">N/A</p>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Repository */}
            <div className="lg:col-span-2">
              <Card shadow="none" className="border border-divider bg-content1">
                <CardBody>
                  <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-3">Repository</p>
                  {app?.repo_url ? (
                    <a
                      href={app.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-mono text-sm break-all"
                    >
                      {app.repo_url}
                    </a>
                  ) : (
                    <p className="text-sm text-default-500">N/A</p>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Backup Configuration */}
            <div className="lg:col-span-2">
              <Card shadow="none" className="border border-divider bg-content1">
                <CardBody>
                  <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-3">Backup Configuration</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-1">Backup Enabled</p>
                      <Switch
                        isSelected={app?.backup_enabled || false}
                        isDisabled
                        size="sm"
                      >
                        {app?.backup_enabled ? 'Enabled' : 'Disabled'}
                      </Switch>
                    </div>
                    {app?.backup_enabled && (
                      <div>
                        <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-1">Backup Frequency</p>
                        <p className="text-sm">{app?.backup_frequency || 'N/A'}</p>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </CardBody>
      </Card>

      {app && (
        <AppEditModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          app={app}
          onSave={handleEditSave}
        />
      )}
    </PageContainer>
  )
}

export default AppDetailPage

