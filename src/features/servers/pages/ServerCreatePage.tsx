import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardBody,
  Input,
  Textarea,
  Select,
  SelectItem,
  Button,
  Switch,
} from '@heroui/react'
import { ArrowLeft } from 'lucide-react'
import { serverService } from '../services/serverService'
import { useApiError } from '@/lib/hooks/useApiError'
import { PageContainer } from '@/components/PageContainer'

function ServerCreatePage() {
  const navigate = useNavigate()
  const { handleError } = useApiError()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    ip: '',
    // docker_mode is multi-select: string[]
    docker_mode: [] as string[],
    // environment maps to env: 'prd' | 'dev' (default 'prd')
    environment: 'prd',
    os: '',
    status: 'online',
    location: '',
    is_netdata_enabled: false,
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) return
    setLoading(true)
    try {
      const server = await serverService.create(formData)
      navigate(`/servers/${server.id}`)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <PageContainer className="py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-divider pb-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              variant="flat"
              onPress={() => navigate('/servers')}
              aria-label="Back to servers"
              size="sm"
            >
              <ArrowLeft size={16} />
            </Button>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Create New Server
            </h1>
          </div>
          <p className="text-default-500 font-medium">Add a new server to monitor</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="flat"
            onPress={() => navigate('/servers')}
            isDisabled={loading}
            className="font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="server-create-form"
            color="primary"
            variant="shadow"
            isLoading={loading}
            isDisabled={loading || !formData.name?.trim()}
            className="font-bold px-8"
          >
            Create Server
          </Button>
        </div>
      </div>

      <Card shadow="sm" className="border-none bg-content1 p-8">
        <CardBody className="p-0">
          <form id="server-create-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Server Name"
                placeholder="e.g. Production Server 01"
                value={formData.name}
                onValueChange={(v) => handleChange('name', v)}
                isRequired
                variant="flat"
              />
              <Input
                label="IP Address"
                placeholder="e.g. 192.168.1.100"
                value={formData.ip}
                onValueChange={(v) => handleChange('ip', v)}
                variant="flat"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Host"
                placeholder="e.g. server01.example.com"
                value={formData.host}
                onValueChange={(v) => handleChange('host', v)}
                variant="flat"
              />
              <Select
                label="Environment"
                selectedKeys={formData.environment ? [formData.environment] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string
                  if (value === 'prd' || value === 'dev') {
                    handleChange('environment', value)
                  }
                }}
                variant="flat"
              >
                <SelectItem key="prd">Production</SelectItem>
                <SelectItem key="dev">Development</SelectItem>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Operating System"
                placeholder="e.g. Ubuntu 22.04 LTS"
                value={formData.os}
                onValueChange={(v) => handleChange('os', v)}
                variant="flat"
              />
              <Select
                label="Status"
                selectedKeys={formData.status ? [formData.status] : []}
                onSelectionChange={(keys) => handleChange('status', Array.from(keys)[0])}
                variant="flat"
              >
                <SelectItem key="online">Online</SelectItem>
                <SelectItem key="offline">Offline</SelectItem>
                <SelectItem key="maintenance">Maintenance</SelectItem>
              </Select>
            </div>

            <Select
              label="Docker Mode"
              selectionMode="multiple"
              selectedKeys={new Set(formData.docker_mode)}
              onSelectionChange={(keys) => {
                const values = Array.from(keys) as string[]
                const valid = values.filter((v) => ['cli', 'desktop', 'none'].includes(v))
                // If 'none' is selected with others, remove 'none'
                const normalized =
                  valid.includes('cli') || valid.includes('desktop')
                    ? valid.filter((v) => v !== 'none')
                    : valid
                handleChange('docker_mode', normalized)
              }}
              variant="flat"
            >
              <SelectItem key="none">None</SelectItem>
              <SelectItem key="cli">CLI</SelectItem>
              <SelectItem key="desktop">Desktop</SelectItem>
            </Select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Location"
                placeholder="Enter server location"
                value={formData.location}
                onValueChange={(v) => handleChange('location', v)}
                variant="flat"
              />
              <div className="flex items-center">
                <Switch
                  isSelected={formData.is_netdata_enabled}
                  onValueChange={(value) => handleChange('is_netdata_enabled', value)}
                >
                  Netdata Enabled
                </Switch>
              </div>
            </div>

            <Textarea
              label="Notes"
              placeholder="Enter notes"
              value={formData.notes}
              onValueChange={(v) => handleChange('notes', v)}
              minRows={3}
              variant="flat"
            />
          </form>
        </CardBody>
      </Card>
    </PageContainer>
  )
}

export default ServerCreatePage

