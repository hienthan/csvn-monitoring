import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Card,
  CardBody,
  Input,
  Textarea,
  Button,
  Select,
  SelectItem,
  Switch,
} from '@heroui/react'
import { ArrowLeft } from 'lucide-react'
import { backupService } from '../services/backupService'
import { useApiError } from '@/lib/hooks/useApiError'
import { PageContainer } from '@/components/PageContainer'
import { useServers } from '@/features/servers/hooks/useServers'
import { appService } from '@/features/apps/services/appService'
import { useAuth } from '@/features/auth/context/AuthContext'
import { isAdmin } from '@/constants/admin'
import type { BackupTargetType, BackupScheduleType, BackupStorageBackend, BackupCompression } from '../types'

function BackupCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const appIdFromUrl = searchParams.get('app')
  const { handleError } = useApiError()
  const { user } = useAuth()
  const { servers } = useServers({})
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    app_id: appIdFromUrl || '',
    server_id: '',
    target_type: 'db_dump' as BackupTargetType,
    source_ref: '',
    backup_script: '',
    pre_hook_script: '',
    post_hook_script: '',
    schedule_type: 'daily' as BackupScheduleType,
    schedule_spec: '',
    timezone: 'Asia/Ho_Chi_Minh',
    storage_backend: 'local_fs' as BackupStorageBackend,
    storage_path_template: '',
    retention_keep_days: 3,
    retention_keep_last_n: undefined as number | undefined,
    compression: 'gzip' as BackupCompression,
    encryption: false,
    is_enabled: true,
    meta: {} as Record<string, unknown>,
  })

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const result = await appService.list({ perPage: 1000 })
        setApps(result.items)
      } catch (err) {
        console.error('Error fetching apps:', err)
      }
    }
    fetchApps()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim() || !formData.app_id || !formData.server_id) return
    setLoading(true)
    try {
      const backup = await backupService.create(formData)
      navigate(`/backups/${backup.id}`)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isAdminUser = isAdmin(user)

  if (!isAdminUser) {
    return (
      <PageContainer className="py-8">
        <Card>
          <CardBody className="p-6">
            <p className="text-danger">You don't have permission to create backups.</p>
            <Button className="mt-4" onPress={() => navigate('/backups')}>
              Back to Backups
            </Button>
          </CardBody>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-divider pb-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              variant="flat"
              onPress={() => navigate('/backups')}
              aria-label="Back to backups"
              size="sm"
            >
              <ArrowLeft size={16} />
            </Button>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Create New Backup Target
            </h1>
          </div>
          <p className="text-default-500 font-medium">Add a new backup target to monitor</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="flat"
            onPress={() => navigate('/backups')}
            isDisabled={loading}
            className="font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="backup-create-form"
            color="primary"
            variant="shadow"
            isLoading={loading}
            isDisabled={loading || !formData.name?.trim() || !formData.app_id || !formData.server_id}
            className="font-bold px-8"
          >
            Create Backup
          </Button>
        </div>
      </div>

      <Card shadow="sm" className="border-none bg-content1 p-8">
        <CardBody className="p-0">
          <form id="backup-create-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-default-700">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  placeholder="e.g. database_dump"
                  value={formData.name}
                  onValueChange={(v) => handleChange('name', v)}
                  isRequired
                  variant="flat"
                  autoFocus
                />

                <Textarea
                  label="Description"
                  placeholder="Enter description"
                  value={formData.description}
                  onValueChange={(v) => handleChange('description', v)}
                  variant="flat"
                />

                <Select
                  label="App"
                  placeholder="Select app"
                  selectedKeys={formData.app_id ? new Set([formData.app_id]) : new Set()}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string
                    if (value) {
                      handleChange('app_id', value)
                      const selectedApp = apps.find(a => a.id === value)
                      if (selectedApp?.server) {
                        handleChange('server_id', selectedApp.server)
                      }
                    }
                  }}
                  isRequired
                  variant="flat"
                >
                  {apps.map((app) => (
                    <SelectItem key={app.id}>
                      {app.name || app.key || app.id}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Server"
                  placeholder="Select server"
                  selectedKeys={formData.server_id ? new Set([formData.server_id]) : new Set()}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string
                    if (value) handleChange('server_id', value)
                  }}
                  isRequired
                  variant="flat"
                >
                  {servers.map((server) => (
                    <SelectItem key={server.id}>
                      {server.name || server.ip || server.id}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Target Configuration */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-default-700">Target Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Target Type"
                  selectedKeys={formData.target_type ? new Set([formData.target_type]) : new Set()}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as BackupTargetType
                    if (value) handleChange('target_type', value)
                  }}
                  isRequired
                  variant="flat"
                >
                  <SelectItem key="db_dump">Database Dump</SelectItem>
                  <SelectItem key="filesystem">Filesystem</SelectItem>
                  <SelectItem key="docker_volume">Docker Volume</SelectItem>
                  <SelectItem key="docker_container_optional">Docker Container (Optional)</SelectItem>
                </Select>

                <Input
                  label="Source Reference"
                  placeholder="e.g. /var/lib/postgresql/data or volume_name"
                  value={formData.source_ref}
                  onValueChange={(v) => handleChange('source_ref', v)}
                  variant="flat"
                />

                <Input
                  label="Backup Script"
                  placeholder="/path/to/backup.sh"
                  value={formData.backup_script}
                  onValueChange={(v) => handleChange('backup_script', v)}
                  variant="flat"
                />

                <Input
                  label="Pre-hook Script (optional)"
                  placeholder="/path/to/pre-hook.sh"
                  value={formData.pre_hook_script}
                  onValueChange={(v) => handleChange('pre_hook_script', v)}
                  variant="flat"
                />

                <Input
                  label="Post-hook Script (optional)"
                  placeholder="/path/to/post-hook.sh"
                  value={formData.post_hook_script}
                  onValueChange={(v) => handleChange('post_hook_script', v)}
                  variant="flat"
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-default-700">Schedule</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Schedule Type"
                  selectedKeys={formData.schedule_type ? new Set([formData.schedule_type]) : new Set()}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as BackupScheduleType
                    if (value) handleChange('schedule_type', value)
                  }}
                  variant="flat"
                >
                  <SelectItem key="manual_only">Manual Only</SelectItem>
                  <SelectItem key="daily">Daily</SelectItem>
                  <SelectItem key="weekly">Weekly</SelectItem>
                  <SelectItem key="cron">Cron</SelectItem>
                </Select>

                <Input
                  label="Schedule Spec"
                  placeholder="e.g. 02:00 (for daily) or 0 2 * * * (for cron)"
                  value={formData.schedule_spec}
                  onValueChange={(v) => handleChange('schedule_spec', v)}
                  variant="flat"
                />

                <Input
                  label="Timezone"
                  value={formData.timezone}
                  onValueChange={(v) => handleChange('timezone', v)}
                  variant="flat"
                />
              </div>
            </div>

            {/* Storage & Retention */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-default-700">Storage & Retention</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Storage Backend"
                  selectedKeys={formData.storage_backend ? new Set([formData.storage_backend]) : new Set()}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as BackupStorageBackend
                    if (value) handleChange('storage_backend', value)
                  }}
                  variant="flat"
                >
                  <SelectItem key="local_fs">Local FS</SelectItem>
                  <SelectItem key="nas">NAS</SelectItem>
                  <SelectItem key="s3">S3</SelectItem>
                  <SelectItem key="remote">Remote</SelectItem>
                </Select>

                <Input
                  label="Storage Path Template"
                  placeholder="/backups/{app}/{target}/{date}"
                  value={formData.storage_path_template}
                  onValueChange={(v) => handleChange('storage_path_template', v)}
                  variant="flat"
                />

                <Input
                  label="Retention Keep Days"
                  type="number"
                  value={String(formData.retention_keep_days || '')}
                  onValueChange={(v) => handleChange('retention_keep_days', v ? parseInt(v, 10) : undefined)}
                  variant="flat"
                />

                <Input
                  label="Retention Keep Last N (optional)"
                  type="number"
                  value={String(formData.retention_keep_last_n || '')}
                  onValueChange={(v) => handleChange('retention_keep_last_n', v ? parseInt(v, 10) : undefined)}
                  variant="flat"
                />

                <Select
                  label="Compression"
                  selectedKeys={formData.compression ? new Set([formData.compression]) : new Set()}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as BackupCompression
                    if (value) handleChange('compression', value)
                  }}
                  variant="flat"
                >
                  <SelectItem key="none">None</SelectItem>
                  <SelectItem key="gzip">Gzip</SelectItem>
                  <SelectItem key="zstd">Zstd</SelectItem>
                </Select>

                <Switch
                  isSelected={formData.encryption}
                  onValueChange={(value) => handleChange('encryption', value)}
                >
                  Encryption
                </Switch>
              </div>
            </div>

            {/* Control */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-default-700">Control</h4>
              <Switch
                isSelected={formData.is_enabled}
                onValueChange={(value) => handleChange('is_enabled', value)}
              >
                Enabled
              </Switch>
            </div>
          </form>
        </CardBody>
      </Card>
    </PageContainer>
  )
}

export default BackupCreatePage
