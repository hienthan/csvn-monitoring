import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Switch,
  Textarea,
} from '@heroui/react'
import type { Server } from '@/features/servers/types'

interface ServerEditModalProps {
  isOpen: boolean
  onClose: () => void
  server: Server | null
  onSave: (payload: Partial<Server>) => Promise<void>
}

export function ServerEditModal({
  isOpen,
  onClose,
  server,
  onSave,
}: ServerEditModalProps) {
  const [formData, setFormData] = useState<Partial<Server>>({
    name: '',
    host: '',
    ip: '',
    docker_mode: 'none',
    environment: 'prd',
    os: '',
    status: 'online',
    location: '',
    is_netdata_enabled: false,
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const initialFormRef = useRef<Partial<Server> | null>(null)

  useEffect(() => {
    if (isOpen && server) {
      // Normalize env/environment
      const rawEnv = server.environment || (server as any).env || 'prd'
      const envLower = String(rawEnv).toLowerCase()
      const normalizedEnv = envLower === 'dev' || envLower === 'development' ? 'dev' : 'prd'

      // Normalize docker_mode to string: 'none' | 'cli' | 'desktop'
      let normalizedDocker: string = 'none'
      if (typeof server.docker_mode === 'boolean') {
        normalizedDocker = server.docker_mode ? 'cli' : 'none'
      } else if (typeof server.docker_mode === 'string') {
        const modeLower = server.docker_mode.toLowerCase()
        if (modeLower === 'cli' || modeLower === 'desktop' || modeLower === 'none') {
          normalizedDocker = modeLower
        }
      }

      const normalizedStatus =
        typeof (server as any).is_active === 'boolean'
          ? ((server as any).is_active ? 'online' : 'offline')
          : (server.status || 'online')

      const nextForm = {
        name: server.name || '',
        host: server.host || '',
        ip: server.ip || '',
        docker_mode: normalizedDocker,
        environment: normalizedEnv,
        os: server.os || '',
        status: normalizedStatus,
        location: server.location || '',
        is_netdata_enabled: server.is_netdata_enabled || false,
        notes: server.notes || '',
      }

      setFormData(nextForm)
      initialFormRef.current = nextForm
    } else if (!isOpen) {
      setFormData({
        name: '',
        host: '',
        ip: '',
        docker_mode: 'none',
        environment: 'prd',
        os: '',
        status: 'online',
        location: '',
        is_netdata_enabled: false,
        notes: '',
      })
      initialFormRef.current = null
    }
  }, [isOpen, server])

  const handleSubmit = async () => {
    if (!server) return

    setLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setLoading(false)
    }
  }

  const isDirty = useMemo(() => {
    if (!initialFormRef.current) return false
    return JSON.stringify(formData) !== JSON.stringify(initialFormRef.current)
  }, [formData])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      placement="center"
      scrollBehavior="inside"
      isDismissable={true}
      hideCloseButton={false}
      classNames={{
        base: "z-50",
        backdrop: "z-40",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Edit Server
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  id="edit-server-name"
                  name="name"
                  label="Server Name"
                  placeholder="Enter server name"
                  value={formData.name || ''}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, name: value }))
                  }
                  isRequired
                  isDisabled={loading}
                  autoFocus
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="edit-server-ip"
                    name="ip"
                    label="IP Address"
                    placeholder="Enter IP address"
                    value={formData.ip || ''}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, ip: value }))
                    }
                    isDisabled={loading}
                  />

                  <Input
                    id="edit-server-host"
                    name="host"
                    label="Host"
                    placeholder="Enter host"
                    value={formData.host || ''}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, host: value }))
                    }
                    isDisabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    id="edit-server-environment"
                    name="environment"
                    label="Environment"
                    placeholder="Select environment"
                    selectedKeys={
                      formData.environment && ['prd', 'dev'].includes(formData.environment)
                        ? new Set([formData.environment])
                        : new Set()
                    }
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string
                      if (value && ['prd', 'dev'].includes(value)) {
                        setFormData((prev) => ({ ...prev, environment: value }))
                      }
                    }}
                    isRequired
                    isDisabled={loading}
                    aria-label="Server environment"
                  >
                    <SelectItem key="prd">Production</SelectItem>
                    <SelectItem key="dev">Development</SelectItem>
                  </Select>

                  <Select
                    id="edit-server-status"
                    name="status"
                    label="Status"
                    placeholder="Select status"
                    selectedKeys={
                      formData.status && ['online', 'offline', 'maintenance'].includes(formData.status)
                        ? new Set([formData.status])
                        : new Set()
                    }
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string
                      if (value && ['online', 'offline', 'maintenance'].includes(value)) {
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
                    }}
                    isRequired
                    isDisabled={loading}
                    aria-label="Server status"
                  >
                    <SelectItem key="online">Online</SelectItem>
                    <SelectItem key="offline">Offline</SelectItem>
                    <SelectItem key="maintenance">Maintenance</SelectItem>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="edit-server-os"
                    name="os"
                    label="Operating System"
                    placeholder="Enter OS"
                    value={formData.os || ''}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, os: value }))
                    }
                    isDisabled={loading}
                  />

                  <Select
                    id="edit-server-docker-mode"
                    name="docker_mode"
                    label="Docker Mode"
                    selectedKeys={
                      formData.docker_mode && ['none', 'cli', 'desktop'].includes(String(formData.docker_mode))
                        ? new Set([String(formData.docker_mode)])
                        : new Set(['none'])
                    }
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string
                      if (value && ['none', 'cli', 'desktop'].includes(value)) {
                        setFormData((prev) => ({ ...prev, docker_mode: value }))
                      }
                    }}
                    isDisabled={loading}
                    aria-label="Docker mode"
                  >
                    <SelectItem key="none">None</SelectItem>
                    <SelectItem key="cli">CLI</SelectItem>
                    <SelectItem key="desktop">Desktop</SelectItem>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="edit-server-location"
                    name="location"
                    label="Location"
                    placeholder="Enter server location"
                    value={formData.location || ''}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, location: value }))
                    }
                    isDisabled={loading}
                  />

                  <div className="flex items-center">
                    <Switch
                      id="edit-server-netdata"
                      isSelected={formData.is_netdata_enabled || false}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, is_netdata_enabled: value }))
                      }
                      isDisabled={loading}
                    >
                      Netdata Enabled
                    </Switch>
                  </div>
                </div>

                <Textarea
                  id="edit-server-notes"
                  name="notes"
                  label="Notes"
                  placeholder="Enter notes"
                  value={formData.notes || ''}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, notes: value }))
                  }
                  minRows={4}
                  isDisabled={loading}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} isDisabled={loading}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={loading}
                isDisabled={!formData.name?.trim() || !isDirty}
              >
                Save Changes
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

