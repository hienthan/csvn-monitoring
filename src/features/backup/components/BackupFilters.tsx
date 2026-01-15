import { Input, Select, SelectItem, Checkbox } from '@heroui/react'
import { Search, X } from 'lucide-react'
import { Button } from '@heroui/react'
import type { Server } from '@/features/servers/types'
import type { ServerApp } from '@/features/apps/types'

export type BackupStatusFilter = 'all' | 'healthy' | 'overdue' | 'failed' | 'disabled' | 'running'

interface BackupFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  serverFilter: string | undefined
  onServerFilterChange: (value: string | undefined) => void
  appFilter: string | undefined
  onAppFilterChange: (value: string | undefined) => void
  statusFilter: BackupStatusFilter
  onStatusFilterChange: (value: BackupStatusFilter) => void
  showHeavyOnly: boolean
  onShowHeavyOnlyChange: (value: boolean) => void
  servers: Server[]
  apps: ServerApp[]
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function BackupFilters({
  searchQuery,
  onSearchChange,
  serverFilter,
  onServerFilterChange,
  appFilter,
  onAppFilterChange,
  statusFilter,
  onStatusFilterChange,
  showHeavyOnly,
  onShowHeavyOnlyChange,
  servers,
  apps,
  hasActiveFilters,
  onClearFilters,
}: BackupFiltersProps) {
  const serverItems = [
    { key: 'all', label: 'All servers' },
    ...servers.map((server) => ({
      key: server.id,
      label: server.name || server.ip || server.id,
    })),
  ]

  const appItems = [
    { key: 'all', label: 'All apps' },
    ...apps.map((app) => ({
      key: app.id,
      label: app.name || app.key || app.id,
    })),
  ]

  const statusItems: { key: BackupStatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'healthy', label: 'Healthy' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'failed', label: 'Failed' },
    { key: 'disabled', label: 'Disabled' },
    { key: 'running', label: 'Running' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-content1/30 rounded-lg border border-divider">
      <Input
        placeholder="Search backups..."
        value={searchQuery}
        onValueChange={onSearchChange}
        startContent={<Search className="w-4 h-4 text-default-400" />}
        size="sm"
        className="flex-1 min-w-[200px]"
        classNames={{
          input: 'text-sm',
        }}
      />

      <Select
        label="Server"
        placeholder="All servers"
        selectedKeys={serverFilter ? new Set([serverFilter]) : new Set(['all'])}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string | undefined
          onServerFilterChange(selected === 'all' ? undefined : selected)
        }}
        items={serverItems}
        size="sm"
        className="min-w-[150px]"
        classNames={{
          trigger: 'h-9',
        }}
      >
        {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
      </Select>

      <Select
        label="App"
        placeholder="All apps"
        selectedKeys={appFilter ? new Set([appFilter]) : new Set(['all'])}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string | undefined
          onAppFilterChange(selected === 'all' ? undefined : selected)
        }}
        items={appItems}
        size="sm"
        className="min-w-[150px]"
        classNames={{
          trigger: 'h-9',
        }}
      >
        {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
      </Select>

      <Select
        label="Status"
        selectedKeys={new Set([statusFilter])}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as BackupStatusFilter
          onStatusFilterChange(selected || 'all')
        }}
        items={statusItems}
        size="sm"
        className="min-w-[120px]"
        classNames={{
          trigger: 'h-9',
        }}
      >
        {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
      </Select>

      <Checkbox
        isSelected={showHeavyOnly}
        onValueChange={onShowHeavyOnlyChange}
        size="sm"
        classNames={{
          label: 'text-sm',
        }}
      >
        Show heavy jobs only
      </Checkbox>

      {hasActiveFilters && (
        <Button
          size="sm"
          variant="light"
          isIconOnly
          onPress={onClearFilters}
          aria-label="Clear filters"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
