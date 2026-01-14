import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardBody,
  Skeleton,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react'
import { Plus } from 'lucide-react'
import { useBackups } from '../hooks/useBackups'
import { useServers } from '@/features/servers/hooks/useServers'
import { appService } from '@/features/apps/services/appService'
import { BackupSummaryCards } from '../components/BackupSummaryCards'
import { BackupFilters, type BackupStatusFilter } from '../components/BackupFilters'
import { BackupTargetsTable } from '../components/BackupTargetsTable'
import { BackupLogModal } from '../components/BackupLogModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageContainer } from '@/components/PageContainer'
import {
  calculateBackupSummary,
  getBackupHealth,
  isHeavyBackup,
} from '../utils/backupStatus'
import { runBackupNow, getOptimisticRunningBackup } from '../services/backupActions'
import { useApiError } from '@/lib/hooks/useApiError'
import { useAuth } from '@/features/auth/context/AuthContext'
import { isAdmin } from '@/constants/admin'
import { hasBackupAdmin } from '../utils/rbac'
import type { Backup } from '../types'
import { Database } from 'lucide-react'

function BackupOverviewPage() {
  const navigate = useNavigate()
  const { backups, loading, error, refetch } = useBackups()
  const { servers } = useServers({})
  const { handleError } = useApiError()
  const { user } = useAuth()
  const isAdminUser = hasBackupAdmin(user)
  const [apps, setApps] = useState<any[]>([])
  const [appsLoading, setAppsLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [serverFilter, setServerFilter] = useState<string | undefined>(undefined)
  const [appFilter, setAppFilter] = useState<string | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<BackupStatusFilter>('all')
  const [showHeavyOnly, setShowHeavyOnly] = useState(false)
  const [activeCardFilter, setActiveCardFilter] = useState<keyof ReturnType<typeof calculateBackupSummary> | null>(null)

  // Modals
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null)
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [runConfirmModalOpen, setRunConfirmModalOpen] = useState(false)
  const [runningBackupId, setRunningBackupId] = useState<string | null>(null)

  // Fetch apps
  useEffect(() => {
    const fetchApps = async () => {
      try {
        setAppsLoading(true)
        const result = await appService.list({ perPage: 1000 })
        setApps(result.items)
      } catch (err) {
        console.error('Error fetching apps:', err)
      } finally {
        setAppsLoading(false)
      }
    }
    if (apps.length === 0 && !appsLoading) {
      fetchApps()
    }
  }, [apps.length, appsLoading])

  // Filter and sort backups
  const filteredBackups = useMemo(() => {
    let filtered = [...backups]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((backup) => {
        const appName = backup.expand?.app_id?.name || backup.app_id || ''
        const serverName =
          backup.expand?.server_id?.name ||
          backup.expand?.server_id?.ip ||
          backup.server_id ||
          ''
        const targetName = backup.name || ''
        const sourceRef = backup.source_ref || ''

        return (
          appName.toLowerCase().includes(query) ||
          serverName.toLowerCase().includes(query) ||
          targetName.toLowerCase().includes(query) ||
          sourceRef.toLowerCase().includes(query)
        )
      })
    }

    // Server filter
    if (serverFilter) {
      filtered = filtered.filter((backup) => backup.server_id === serverFilter)
    }

    // App filter
    if (appFilter) {
      filtered = filtered.filter((backup) => backup.app_id === appFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((backup) => {
        const health = getBackupHealth(backup)
        return health.key === statusFilter
      })
    }

    // Heavy jobs filter
    if (showHeavyOnly) {
      filtered = filtered.filter((backup) => isHeavyBackup(backup))
    }

    // Card filter (when clicking summary card)
    if (activeCardFilter) {
      filtered = filtered.filter((backup) => {
        const health = getBackupHealth(backup)
        return health.key === activeCardFilter
      })
    }

    // Sort: by severity (Disabled/Running/Failed/Overdue first) then by next_due_at asc, then by app name
    filtered.sort((a, b) => {
      const healthA = getBackupHealth(a)
      const healthB = getBackupHealth(b)

      const precedence: Record<string, number> = {
        disabled: 1,
        running: 2,
        failed: 3,
        overdue: 4,
        healthy: 5,
        unknown: 6,
      }

      const orderA = precedence[healthA.key] || 99
      const orderB = precedence[healthB.key] || 99

      if (orderA !== orderB) {
        return orderA - orderB
      }

      // Then by next_due_at
      if (a.next_due_at && b.next_due_at) {
        const dateA = new Date(a.next_due_at).getTime()
        const dateB = new Date(b.next_due_at).getTime()
        if (dateA !== dateB) {
          return dateA - dateB
        }
      } else if (a.next_due_at) {
        return -1
      } else if (b.next_due_at) {
        return 1
      }

      // Then by app name
      const appNameA = a.expand?.app_id?.name || a.app_id || ''
      const appNameB = b.expand?.app_id?.name || b.app_id || ''
      return appNameA.localeCompare(appNameB)
    })

    return filtered
  }, [
    backups,
    searchQuery,
    serverFilter,
    appFilter,
    statusFilter,
    showHeavyOnly,
    activeCardFilter,
  ])

  // Calculate summary
  const summary = useMemo(() => {
    return calculateBackupSummary(filteredBackups)
  }, [filteredBackups])

  const hasActiveFilters =
    !!searchQuery ||
    !!serverFilter ||
    !!appFilter ||
    statusFilter !== 'all' ||
    showHeavyOnly ||
    !!activeCardFilter

  const handleClearFilters = () => {
    setSearchQuery('')
    setServerFilter(undefined)
    setAppFilter(undefined)
    setStatusFilter('all')
    setShowHeavyOnly(false)
    setActiveCardFilter(null)
  }

  const handleCardClick = (key: keyof ReturnType<typeof calculateBackupSummary>) => {
    if (activeCardFilter === key) {
      setActiveCardFilter(null)
    } else {
      setActiveCardFilter(key)
    }
  }

  const handleRunNow = (backup: Backup) => {
    setSelectedBackup(backup)
    setRunConfirmModalOpen(true)
  }

  const handleConfirmRun = async () => {
    if (!selectedBackup) return

    try {
      setRunningBackupId(selectedBackup.id)
      setRunConfirmModalOpen(false)

      // Optimistic update
      const optimisticBackup = getOptimisticRunningBackup(selectedBackup)
      // Update local state (we'll need to refetch after)
      // For now, just call the API
      await runBackupNow(selectedBackup.id)

      // Show toast (stub message if no endpoint)
      const endpoint = import.meta.env.VITE_BACKUP_RUN_ENDPOINT
      if (!endpoint) {
        console.log('Run triggered (stub). Configure VITE_BACKUP_RUN_ENDPOINT to execute real backups.')
      }

      // Revert optimistic update after 10 seconds
      setTimeout(() => {
        setRunningBackupId(null)
        refetch()
      }, 10000)

      // Also refetch after a delay to get real status
      setTimeout(() => {
        refetch()
      }, 2000)
    } catch (err) {
      handleError(err)
      setRunningBackupId(null)
    } finally {
      setSelectedBackup(null)
    }
  }

  const handleViewLog = (backup: Backup) => {
    setSelectedBackup(backup)
    setLogModalOpen(true)
  }

  if (error) {
    return (
      <PageContainer className="py-8 space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Backups</h1>
          <p className="text-sm text-danger">Error loading backups: {error.message}</p>
        </div>
        <Card>
          <CardBody className="p-6">
            <EmptyState
              title="Error loading backups"
              description={error.message}
              actionLabel="Retry"
              onAction={() => refetch()}
            />
          </CardBody>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="py-8 space-y-6">
      <div className="flex items-end justify-between border-b border-divider pb-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Backups</h1>
          <p className="text-sm text-default-500">Monitor and manage backup operations</p>
        </div>
        {isAdminUser && (
          <Button
            color="primary"
            variant="shadow"
            startContent={<Plus size={18} />}
            onPress={() => navigate('/backups/new')}
            className="font-bold"
          >
            New Backup
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <BackupSummaryCards
          summary={summary}
          onCardClick={handleCardClick}
          activeFilter={activeCardFilter}
        />
      )}

      <BackupFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        serverFilter={serverFilter}
        onServerFilterChange={setServerFilter}
        appFilter={appFilter}
        onAppFilterChange={setAppFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        showHeavyOnly={showHeavyOnly}
        onShowHeavyOnlyChange={setShowHeavyOnly}
        servers={servers}
        apps={apps}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      {loading ? (
        <Card>
          <CardBody className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded" />
              ))}
            </div>
          </CardBody>
        </Card>
      ) : filteredBackups.length === 0 ? (
        <Card>
          <CardBody className="p-6">
            <EmptyState
              title="No backups found"
              description="Adjust filters or create backup targets."
              icon={Database}
            />
          </CardBody>
        </Card>
      ) : (
        <BackupTargetsTable
          backups={filteredBackups.map((backup) =>
            runningBackupId === backup.id
              ? getOptimisticRunningBackup(backup)
              : backup
          )}
          onRunNow={handleRunNow}
          onViewLog={handleViewLog}
        />
      )}

      <BackupLogModal
        isOpen={logModalOpen}
        onClose={() => {
          setLogModalOpen(false)
          setSelectedBackup(null)
        }}
        backup={selectedBackup}
      />

      <Modal
        isOpen={runConfirmModalOpen}
        onClose={() => {
          setRunConfirmModalOpen(false)
          setSelectedBackup(null)
        }}
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Run Backup Now?</ModalHeader>
              <ModalBody>
                {selectedBackup && (
                  <div className="space-y-2">
                    <p className="text-sm text-default-600">
                      <span className="font-semibold">
                        {selectedBackup.expand?.app_id?.name || selectedBackup.app_id} /{' '}
                        {selectedBackup.name}
                      </span>
                    </p>
                    {selectedBackup.last_run_at && (
                      <p className="text-xs text-default-500">
                        Last run: {new Date(selectedBackup.last_run_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleConfirmRun}
                  isLoading={runningBackupId === selectedBackup?.id}
                >
                  Run Now
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </PageContainer>
  )
}

export default BackupOverviewPage
