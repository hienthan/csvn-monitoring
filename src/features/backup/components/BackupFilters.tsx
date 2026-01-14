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
        selectedKeys={serverFilter ? [serverFilter] : []}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string | undefined
          onServerFilterChange(selected === 'all' ? undefined : selected)
        }}
        size="sm"
        className="min-w-[150px]"
        classNames={{
          trigger: 'h-9',
        }}
      >
        <SelectItem key="all" value="all">
          All servers
        </SelectItem>
        {servers.map((server) => (
          <SelectItem key={server.id} value={server.id}>
            {server.name || server.ip || server.id}
          </SelectItem>
        ))}
      </Select>

      <Select
        label="App"
        placeholder="All apps"
        selectedKeys={appFilter ? [appFilter] : []}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string | undefined
          onAppFilterChange(selected === 'all' ? undefined : selected)
        }}
        size="sm"
        className="min-w-[150px]"
        classNames={{
          trigger: 'h-9',
        }}
      >
        <SelectItem key="all" value="all">
          All apps
        </SelectItem>
        {apps.map((app) => (
          <SelectItem key={app.id} value={app.id}>
            {app.name || app.key || app.id}
          </SelectItem>
        ))}
      </Select>

      <Select
        label="Status"
        selectedKeys={[statusFilter]}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as BackupStatusFilter
          onStatusFilterChange(selected || 'all')
        }}
        size="sm"
        className="min-w-[120px]"
        classNames={{
          trigger: 'h-9',
        }}
      >
        <SelectItem key="all" value="all">
          All
        </SelectItem>
        <SelectItem key="healthy" value="healthy">
          Healthy
        </SelectItem>
        <SelectItem key="overdue" value="overdue">
          Overdue
        </SelectItem>
        <SelectItem key="failed" value="failed">
          Failed
        </SelectItem>
        <SelectItem key="disabled" value="disabled">
          Disabled
        </SelectItem>
        <SelectItem key="running" value="running">
          Running
        </SelectItem>
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
