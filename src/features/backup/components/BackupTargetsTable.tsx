import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Tooltip,
  Accordion,
  AccordionItem,
} from '@heroui/react'
import { Copy, Play, Check, Eye } from 'lucide-react'
import type { Backup } from '../types'
import {
  getBackupHealth,
  formatBytes,
  formatRetention,
  formatStorageBackend,
  isHeavyBackup,
} from '../utils/backupStatus'
import { hasBackupAdmin } from '../utils/rbac'
import { useAuth } from '@/features/auth/context/AuthContext'
import { copyToClipboard } from '@/lib/utils/clipboard'
import { formatRelativeTime as formatRelativeTimeUtil } from '@/features/tickets/utils'

interface BackupTargetsTableProps {
  backups: Backup[]
  onRunNow?: (backup: Backup) => void
  onViewLog?: (backup: Backup) => void
}

interface GroupedBackup {
  appId: string
  appName: string
  serverId: string
  serverName: string
  backups: Backup[]
  summary: {
    failed: number
    overdue: number
    running: number
  }
}

export function BackupTargetsTable({
  backups,
  onRunNow,
  onViewLog,
}: BackupTargetsTableProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = hasBackupAdmin(user)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Group backups by app
  const groupedBackups = useMemo(() => {
    const groups = new Map<string, GroupedBackup>()

    backups.forEach((backup) => {
      const appId = backup.app_id
      const appName = backup.expand?.app_id?.name || backup.app_id
      const serverId = backup.server_id
      const serverName =
        backup.expand?.server_id?.name ||
        backup.expand?.server_id?.ip ||
        backup.server_id

      if (!groups.has(appId)) {
        groups.set(appId, {
          appId,
          appName,
          serverId,
          serverName,
          backups: [],
          summary: {
            failed: 0,
            overdue: 0,
            running: 0,
          },
        })
      }

      const group = groups.get(appId)!
      group.backups.push(backup)

      const health = getBackupHealth(backup)
      if (health.key === 'failed') group.summary.failed++
      if (health.key === 'overdue') group.summary.overdue++
      if (health.key === 'running') group.summary.running++
    })

    return Array.from(groups.values())
  }, [backups])

  // Default expanded: groups with Failed/Overdue/Running
  const defaultExpandedKeys = useMemo(() => {
    return new Set(
      groupedBackups
        .filter((group) => group.summary.failed > 0 || group.summary.overdue > 0 || group.summary.running > 0)
        .map((group) => group.appId)
    )
  }, [groupedBackups])

  const handleRowClick = (backupId: string) => {
    navigate(`/backups/${backupId}`)
  }

  const handleCopyError = async (backup: Backup, e: React.MouseEvent) => {
    e.stopPropagation()
    if (backup.last_error_summary) {
      const success = await copyToClipboard(backup.last_error_summary)
      if (success) {
        setCopiedId(backup.id)
        setTimeout(() => setCopiedId(null), 2000)
      }
    }
  }

  const handleRunNow = (backup: Backup, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRunNow) {
      onRunNow(backup)
    }
  }

  const handleViewLog = (backup: Backup, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onViewLog) {
      onViewLog(backup)
    }
  }

  const formatNextDue = (backup: Backup): string => {
    if (!backup.next_due_at) return 'Manual'
    const date = new Date(backup.next_due_at)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (groupedBackups.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <Accordion
        defaultExpandedKeys={defaultExpandedKeys}
        selectionMode="multiple"
        variant="bordered"
        className="border-divider"
      >
        {groupedBackups.map((group) => {
          const hasIssues = group.summary.failed > 0 || group.summary.overdue > 0 || group.summary.running > 0

          return (
            <AccordionItem
              key={group.appId}
              title={
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground">{group.appName}</span>
                    <span className="text-sm text-default-500">on {group.serverName}</span>
                  </div>
                  {hasIssues && (
                    <div className="flex items-center gap-2">
                      {group.summary.failed > 0 && (
                        <Chip size="sm" color="danger" variant="flat">
                          {group.summary.failed} failed
                        </Chip>
                      )}
                      {group.summary.overdue > 0 && (
                        <Chip size="sm" color="warning" variant="flat">
                          {group.summary.overdue} overdue
                        </Chip>
                      )}
                      {group.summary.running > 0 && (
                        <Chip size="sm" color="primary" variant="flat">
                          {group.summary.running} running
                        </Chip>
                      )}
                    </div>
                  )}
                </div>
              }
            >
              <Table
                aria-label={`Backup targets for ${group.appName}`}
                removeWrapper
                classNames={{
                  th: 'bg-content2/50 text-default-600 font-semibold text-xs uppercase',
                  td: 'text-sm',
                }}
              >
                <TableHeader>
                  <TableColumn>Target</TableColumn>
                  <TableColumn>Status</TableColumn>
                  <TableColumn>Last Run</TableColumn>
                  <TableColumn>Next Due</TableColumn>
                  <TableColumn>Size</TableColumn>
                  <TableColumn>Retention</TableColumn>
                  <TableColumn>Storage</TableColumn>
                  <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                  {group.backups.map((backup) => {
                    const health = getBackupHealth(backup)
                    const hasError = !!backup.last_error_summary
                    const hasLog = !!backup.last_log_path

                    return (
                      <TableRow
                        key={backup.id}
                        className="cursor-pointer hover:bg-content2/50 transition-colors"
                        onClick={() => handleRowClick(backup.id)}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <Tooltip content={backup.description || backup.name}>
                              <span className="font-medium text-foreground truncate max-w-[200px]">
                                {backup.name}
                              </span>
                            </Tooltip>
                            {backup.description && (
                              <span className="text-xs text-default-500 truncate max-w-[200px]">
                                {backup.description}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            variant="flat"
                            color={health.severity}
                            className="font-medium"
                          >
                            {health.label}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Tooltip content={backup.last_run_at || 'Never'}>
                            <span className="text-xs text-default-500">
                              {backup.last_run_at
                                ? formatRelativeTimeUtil(backup.last_run_at)
                                : 'Never'}
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-default-500">{formatNextDue(backup)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-default-500">
                            {formatBytes(backup.last_backup_size_bytes)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-default-500">
                            {formatRetention(backup)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-default-500">
                            {formatStorageBackend(backup.storage_backend)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {hasLog && (
                              <Tooltip content="View log">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  className="min-w-0 h-6 w-6"
                                  onPress={(e) => handleViewLog(backup, e as any)}
                                  aria-label="View log"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                              </Tooltip>
                            )}
                            {hasError && (
                              <Tooltip content="Copy error">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  className="min-w-0 h-6 w-6"
                                  onPress={(e) => handleCopyError(backup, e as any)}
                                  aria-label="Copy error"
                                >
                                  {copiedId === backup.id ? (
                                    <Check className="w-3.5 h-3.5 text-success" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                              </Tooltip>
                            )}
                            <Tooltip
                              content={
                                isAdmin
                                  ? 'Run now'
                                  : "You don't have permission to perform this action."
                              }
                            >
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="min-w-0 h-6 w-6"
                                isDisabled={!isAdmin}
                                onPress={(e) => handleRunNow(backup, e as any)}
                                aria-label="Run now"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </Button>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
