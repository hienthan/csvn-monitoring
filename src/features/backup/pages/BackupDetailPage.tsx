import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Tabs,
  Tab,
  Chip,
  Card,
  CardBody,
  Button,
  Skeleton,
  Switch,
  Code,
  Alert,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/react'
import { Play, Copy, Check, AlertTriangle, Trash2 } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { useBackupDetail } from '../hooks/useBackupDetail'
import { useApiError } from '@/lib/hooks/useApiError'
import { PageContainer } from '@/components/PageContainer'
import {
  getBackupHealth,
  formatBytes,
  formatDuration,
  formatRetention,
  formatStorageBackend,
  formatScheduleSummary,
  isBackupOverdue,
} from '../utils/backupStatus'
import { hasBackupAdmin } from '../utils/rbac'
import { useAuth } from '@/features/auth/context/AuthContext'
import { runBackupNow } from '../services/backupActions'
import { backupService } from '../services/backupService'
import { copyToClipboard } from '@/lib/utils/clipboard'
import { formatRelativeTime } from '@/features/tickets/utils'
import { BackupLogModal } from '../components/BackupLogModal'

function BackupDetailPage() {
  const { backupId } = useParams()
  const navigate = useNavigate()
  const { backup, loading, error, update, refetch } = useBackupDetail(backupId)
  const { handleError } = useApiError()
  const { user } = useAuth()
  const isAdmin = hasBackupAdmin(user)
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [runConfirmModalOpen, setRunConfirmModalOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const handleRunNow = () => {
    setRunConfirmModalOpen(true)
  }

  const handleConfirmRun = async () => {
    if (!backup) return

    try {
      setRunning(true)
      setRunConfirmModalOpen(false)

      await runBackupNow(backup.id)

      const endpoint = import.meta.env.VITE_BACKUP_RUN_ENDPOINT
      if (!endpoint) {
        console.log('Run triggered (stub). Configure VITE_BACKUP_RUN_ENDPOINT to execute real backups.')
      }

      // Revert optimistic update after 10 seconds
      setTimeout(() => {
        setRunning(false)
        refetch()
      }, 10000)

      // Also refetch after a delay to get real status
      setTimeout(() => {
        refetch()
      }, 2000)
    } catch (err) {
      handleError(err)
      setRunning(false)
    }
  }

  const handleToggleEnabled = async (enabled: boolean) => {
    if (!backup) return

    try {
      setToggling(true)
      await update({ is_enabled: enabled })
      await refetch()
    } catch (err) {
      handleError(err)
    } finally {
      setToggling(false)
    }
  }

  const handleCopyArtifactPath = async () => {
    if (backup?.last_artifact_path) {
      const success = await copyToClipboard(backup.last_artifact_path)
      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  const handleDelete = async () => {
    if (!backup) return
    setDeleting(true)
    try {
      await backupService.delete(backup.id)
      navigate('/backups')
    } catch (err) {
      handleError(err)
    } finally {
      setDeleting(false)
      setDeleteConfirmOpen(false)
    }
  }

  if (error) {
    return (
      <PageContainer className="py-8">
        <div className="space-y-4">
          <Breadcrumb
            items={[
              { label: 'Backups', path: '/backups' },
              { label: 'Error', path: '/backups' },
            ]}
          />
          <Card>
            <CardBody className="p-6">
              <p className="text-danger">Error loading backup: {error.message}</p>
              <Button className="mt-4" onPress={() => refetch()}>
                Retry
              </Button>
            </CardBody>
          </Card>
        </div>
      </PageContainer>
    )
  }

  if (loading || !backup) {
    return (
      <PageContainer className="py-8">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </PageContainer>
    )
  }

  const health = getBackupHealth(backup)
  const appName = backup.expand?.app_id?.name || backup.app_id
  const serverName =
    backup.expand?.server_id?.name ||
    backup.expand?.server_id?.ip ||
    backup.server_id
  const isOverdue = isBackupOverdue(backup)

  return (
    <PageContainer className="py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Breadcrumb
            items={[
              { label: 'Backups', path: '/backups' },
              { label: appName, path: '/backups' },
              { label: backup.name, path: `/backups/${backup.id}` },
            ]}
          />
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {appName} / {backup.name}
            </h1>
            <Chip
              size="sm"
              variant="flat"
              color={health.severity}
              className="font-medium"
            >
              {health.label}
            </Chip>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip
            content={
              isAdmin
                ? 'Run backup now'
                : "You don't have permission to perform this action."
            }
          >
            <Button
              color="primary"
              variant="flat"
              startContent={<Play className="w-4 h-4" />}
              isDisabled={!isAdmin || running}
              isLoading={running}
              onPress={handleRunNow}
            >
              Run Now
            </Button>
          </Tooltip>
          {isAdmin && (
            <>
              <Switch
                isSelected={backup.is_enabled !== false}
                onValueChange={handleToggleEnabled}
                isDisabled={toggling}
                classNames={{
                  label: 'text-sm',
                }}
              >
                {backup.is_enabled !== false ? 'Enabled' : 'Disabled'}
              </Switch>
              <Tooltip content="Delete backup">
                <Button
                  color="danger"
                  variant="light"
                  isIconOnly
                  startContent={<Trash2 className="w-4 h-4" />}
                  isDisabled={deleting}
                  isLoading={deleting}
                  onPress={() => setDeleteConfirmOpen(true)}
                  aria-label="Delete backup"
                />
              </Tooltip>
            </>
          )}
          {backup.last_artifact_path && (
            <Tooltip content="Copy artifact path">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={handleCopyArtifactPath}
                aria-label="Copy artifact path"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {isOverdue && backup.is_enabled !== false && (
        <Alert
          color="warning"
          variant="flat"
          title="Backup is overdue"
          startContent={<AlertTriangle className="w-4 h-4" />}
        >
          This backup was due to run but hasn't been executed yet.
        </Alert>
      )}

      <Tabs aria-label="Backup details">
        <Tab key="overview" title="Overview">
          <div className="space-y-4 pt-4">
            <Card>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                      Status
                    </p>
                    <div className="flex items-center gap-2">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={health.severity}
                        className="font-medium"
                      >
                        {health.label}
                      </Chip>
                      {backup.last_run_at && (
                        <span className="text-sm text-default-500">
                          {formatRelativeTime(backup.last_run_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  {backup.last_duration_ms && (
                    <div>
                      <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                        Duration
                      </p>
                      <p className="text-sm font-medium">{formatDuration(backup.last_duration_ms)}</p>
                    </div>
                  )}

                  {backup.last_backup_size_bytes && (
                    <div>
                      <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                        Size
                      </p>
                      <p className="text-sm font-medium">{formatBytes(backup.last_backup_size_bytes)}</p>
                    </div>
                  )}

                  {backup.next_due_at && (
                    <div>
                      <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                        Next Due
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(backup.next_due_at).toLocaleString()}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                      Schedule
                    </p>
                    <p className="text-sm font-medium">{formatScheduleSummary(backup)}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                      Storage
                    </p>
                    <p className="text-sm font-medium">{formatStorageBackend(backup.storage_backend)}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                      Retention
                    </p>
                    <p className="text-sm font-medium">{formatRetention(backup)}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                      Server
                    </p>
                    <p className="text-sm font-medium">{serverName}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                      App
                    </p>
                    <p className="text-sm font-medium">{appName}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="configuration" title="Configuration">
          <div className="space-y-4 pt-4">
            <Card>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                      Target Type
                    </p>
                    <p className="text-sm font-medium">{backup.target_type || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                      Source Reference
                    </p>
                    <p className="text-sm font-medium break-all">{backup.source_ref || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                      Backup Script
                    </p>
                    <p className="text-sm font-medium break-all">{backup.backup_script || 'N/A'}</p>
                  </div>

                  {backup.pre_hook_script && (
                    <div>
                      <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                        Pre-hook Script
                      </p>
                      <p className="text-sm font-medium break-all">{backup.pre_hook_script}</p>
                    </div>
                  )}

                  {backup.post_hook_script && (
                    <div>
                      <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                        Post-hook Script
                      </p>
                      <p className="text-sm font-medium break-all">{backup.post_hook_script}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                      Schedule Type
                    </p>
                    <p className="text-sm font-medium">{backup.schedule_type || 'N/A'}</p>
                  </div>

                  {backup.schedule_spec && (
                    <div>
                      <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                        Schedule Spec
                      </p>
                      <p className="text-sm font-medium">{backup.schedule_spec}</p>
                    </div>
                  )}

                  {backup.timezone && (
                    <div>
                      <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                        Timezone
                      </p>
                      <p className="text-sm font-medium">{backup.timezone}</p>
                    </div>
                  )}

                  {backup.storage_path_template && (
                    <div>
                      <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                        Storage Path Template
                      </p>
                      <p className="text-sm font-medium break-all">{backup.storage_path_template}</p>
                    </div>
                  )}

                  {backup.compression && (
                    <div>
                      <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                        Compression
                      </p>
                      <p className="text-sm font-medium">{backup.compression}</p>
                    </div>
                  )}

                  {backup.encryption !== undefined && (
                    <div>
                      <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                        Encryption
                      </p>
                      <p className="text-sm font-medium">{backup.encryption ? 'Yes' : 'No'}</p>
                    </div>
                  )}

                  {backup.meta && (
                    <div className="md:col-span-2">
                      <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
                        Meta (JSON)
                      </p>
                      <Code className="w-full p-3 text-xs bg-content2 border border-divider" radius="sm">
                        <pre className="whitespace-pre-wrap break-words">
                          {JSON.stringify(
                            typeof backup.meta === 'string'
                              ? JSON.parse(backup.meta)
                              : backup.meta,
                            null,
                            2
                          )}
                        </pre>
                      </Code>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="logs" title="Logs">
          <div className="space-y-4 pt-4">
            <Card>
              <CardBody className="space-y-4">
                {backup.last_error_summary ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Error Summary</p>
                      <Button
                        size="sm"
                        variant="light"
                        startContent={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        onPress={async () => {
                          if (backup.last_error_summary) {
                            const success = await copyToClipboard(backup.last_error_summary)
                            if (success) {
                              setCopied(true)
                              setTimeout(() => setCopied(false), 2000)
                            }
                          }
                        }}
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                    </div>
                    <Code
                      className="w-full p-3 text-xs bg-content2 border border-divider"
                      radius="sm"
                    >
                      <pre className="whitespace-pre-wrap break-words">
                        {backup.last_error_summary}
                      </pre>
                    </Code>
                  </div>
                ) : (
                  <p className="text-sm text-default-500">No error summary available.</p>
                )}

                {backup.last_log_path && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Log Path</p>
                      <Button
                        size="sm"
                        variant="light"
                        startContent={<Copy className="w-4 h-4" />}
                        onPress={async () => {
                          if (backup.last_log_path) {
                            await copyToClipboard(backup.last_log_path)
                          }
                        }}
                      >
                        Copy Path
                      </Button>
                    </div>
                    <Code
                      className="w-full p-3 text-xs bg-content2 border border-divider"
                      radius="sm"
                    >
                      {backup.last_log_path}
                    </Code>
                    <p className="text-xs text-default-500">
                      Note: Full log content is stored on the server. This path points to the log file.
                    </p>
                  </div>
                )}

                {!backup.last_error_summary && !backup.last_log_path && (
                  <p className="text-sm text-default-500">No log information available.</p>
                )}
              </CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>

      <BackupLogModal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        backup={backup}
      />

      <Modal
        isOpen={runConfirmModalOpen}
        onClose={() => {
          setRunConfirmModalOpen(false)
        }}
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Run Backup Now?</ModalHeader>
              <ModalBody>
                <div className="space-y-2">
                  <p className="text-sm text-default-600">
                    <span className="font-semibold">
                      {appName} / {backup.name}
                    </span>
                  </p>
                  {backup.last_run_at && (
                    <p className="text-xs text-default-500">
                      Last run: {new Date(backup.last_run_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleConfirmRun} isLoading={running}>
                  Run Now
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete Backup?</ModalHeader>
              <ModalBody>
                <div className="space-y-2">
                  <p className="text-sm text-default-600">
                    Are you sure you want to delete this backup target?
                  </p>
                  <p className="text-sm font-semibold">
                    {appName} / {backup.name}
                  </p>
                  <p className="text-xs text-danger">
                    This action cannot be undone.
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} isDisabled={deleting}>
                  Cancel
                </Button>
                <Button color="danger" onPress={handleDelete} isLoading={deleting}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </PageContainer>
  )
}

export default BackupDetailPage
