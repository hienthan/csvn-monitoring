import { useState } from 'react'
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
import { appService } from '../services/appService'
import { useApiError } from '@/lib/hooks/useApiError'
import { PageContainer } from '@/components/PageContainer'
import { useServers } from '@/features/servers/hooks/useServers'

function AppCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const serverIdFromUrl = searchParams.get('server')
  const { handleError } = useApiError()
  const { servers } = useServers({})
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    department: '',
    server: serverIdFromUrl || '',
    port: '',
    environment: '',
    repo_url: '',
    tech_stack: '',
    owner: '',
    path: '',
    status: '',
    docker_mode: false,
    backup_enabled: false,
    backup_frequency: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) return
    setLoading(true)
    try {
      const app = await appService.create({
        ...formData,
        owner: formData.owner?.trim() || 'System',
      })
      navigate(`/apps/${app.id}`)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }
      // If docker_mode is set to 'none', convert to false
      if (field === 'docker_mode' && value === 'none') {
        updated.docker_mode = false
      } else if (field === 'docker_mode' && (value === 'cli' || value === 'desktop')) {
        updated.docker_mode = value
      }
      return updated
    })
  }

  return (
    <PageContainer className="py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-divider pb-6">
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
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Create New App
            </h1>
          </div>
          <p className="text-default-500 font-medium">Add a new application to monitor</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="flat"
            onPress={() => navigate('/apps')}
            isDisabled={loading}
            className="font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="app-create-form"
            color="primary"
            variant="shadow"
            isLoading={loading}
            isDisabled={loading || !formData.name?.trim()}
            className="font-bold px-8"
          >
            Create App
          </Button>
        </div>
      </div>

      <Card shadow="sm" className="border-none bg-content1 p-8">
        <CardBody className="p-0">
          <form id="app-create-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-default-700">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="App Key"
                  placeholder="e.g. app-001"
                  value={formData.key}
                  onValueChange={(v) => handleChange('key', v)}
                  variant="flat"
                />

                <Input
                  label="Name"
                  placeholder="Enter app name"
                  value={formData.name}
                  onValueChange={(v) => handleChange('name', v)}
                  isRequired
                  variant="flat"
                  autoFocus
                />

                <Input
                  label="Department"
                  placeholder="Enter department"
                  value={formData.department}
                  onValueChange={(v) => handleChange('department', v)}
                  variant="flat"
                />

                <Select
                  label="Server"
                  placeholder="Select server"
                  selectedKeys={formData.server && servers.some(s => s.id === formData.server)
                    ? new Set([formData.server])
                    : new Set()}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string
                    if (value) handleChange('server', value)
                  }}
                  variant="flat"
                  aria-label="Server"
                >
                  {servers.map((server) => (
                    <SelectItem key={server.id}>
                      {server.name || server.id}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  label="Port"
                  placeholder="Enter port number"
                  value={String(formData.port || '')}
                  onValueChange={(v) => handleChange('port', v)}
                  variant="flat"
                />

                <Select
                  label="Environment"
                  placeholder="Select environment"
                  selectedKeys={
                    formData.environment && ['dev', 'stg', 'prd', 'development', 'staging', 'production'].includes(formData.environment)
                      ? new Set([formData.environment])
                      : new Set()
                  }
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string
                    if (value && ['dev', 'stg', 'prd', 'development', 'staging', 'production'].includes(value)) {
                      handleChange('environment', value)
                    }
                  }}
                  variant="flat"
                  aria-label="Environment"
                >
                  <SelectItem key="dev">Development</SelectItem>
                  <SelectItem key="stg">Staging</SelectItem>
                  <SelectItem key="prd">Production</SelectItem>
                </Select>
              </div>
            </div>

            {/* Application Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-default-700">Application Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tech Stack"
                  placeholder="e.g. React, Node.js, PostgreSQL"
                  value={formData.tech_stack}
                  onValueChange={(v) => handleChange('tech_stack', v)}
                  variant="flat"
                />

                <Select
                  label="Status"
                  placeholder="Select status"
                  selectedKeys={
                    formData.status && ['online', 'offline', 'running', 'stopped', 'maintenance'].includes(formData.status)
                      ? new Set([formData.status])
                      : new Set()
                  }
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string
                    if (value && ['online', 'offline', 'running', 'stopped', 'maintenance'].includes(value)) {
                      handleChange('status', value)
                    }
                  }}
                  variant="flat"
                  aria-label="Status"
                >
                  <SelectItem key="online">Online</SelectItem>
                  <SelectItem key="offline">Offline</SelectItem>
                  <SelectItem key="running">Running</SelectItem>
                  <SelectItem key="stopped">Stopped</SelectItem>
                  <SelectItem key="maintenance">Maintenance</SelectItem>
                </Select>

                <Select
                  label="Docker Mode"
                  placeholder="Select docker mode"
                  selectedKeys={
                    formData.docker_mode && ['cli', 'desktop', 'none'].includes(String(formData.docker_mode))
                      ? new Set([String(formData.docker_mode)])
                      : new Set()
                  }
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string
                    if (value && ['cli', 'desktop', 'none'].includes(value)) {
                      handleChange('docker_mode', value)
                    }
                  }}
                  variant="flat"
                  aria-label="Docker Mode"
                >
                  <SelectItem key="cli">CLI</SelectItem>
                  <SelectItem key="desktop">Desktop</SelectItem>
                  <SelectItem key="none">None</SelectItem>
                </Select>
              </div>
            </div>

            {/* Repository */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-default-700">Repository</h4>
              <Input
                label="Repo URL"
                placeholder="https://github.com/user/repo"
                value={formData.repo_url}
                onValueChange={(v) => handleChange('repo_url', v)}
                variant="flat"
              />
            </div>

            {/* Backup Configuration */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-default-700">Backup Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Switch
                  isSelected={formData.backup_enabled || false}
                  onValueChange={(value) => handleChange('backup_enabled', value)}
                >
                  Backup Enabled
                </Switch>

                {formData.backup_enabled && (
                  <Select
                    label="Backup Frequency"
                    placeholder="Select frequency"
                    selectedKeys={
                      formData.backup_frequency && ['daily', 'weekly', 'monthly', 'hourly'].includes(formData.backup_frequency)
                        ? new Set([formData.backup_frequency])
                        : new Set()
                    }
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string
                      if (value && ['daily', 'weekly', 'monthly', 'hourly'].includes(value)) {
                        handleChange('backup_frequency', value)
                      }
                    }}
                    variant="flat"
                    aria-label="Backup Frequency"
                  >
                    <SelectItem key="daily">Daily</SelectItem>
                    <SelectItem key="weekly">Weekly</SelectItem>
                    <SelectItem key="monthly">Monthly</SelectItem>
                    <SelectItem key="hourly">Hourly</SelectItem>
                  </Select>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-default-700">Notes</h4>
              <Textarea
                label="Notes"
                placeholder="Enter notes"
                value={formData.notes}
                onValueChange={(v) => handleChange('notes', v)}
                minRows={4}
                variant="flat"
              />
            </div>
          </form>
        </CardBody>
      </Card>
    </PageContainer>
  )
}

export default AppCreatePage

