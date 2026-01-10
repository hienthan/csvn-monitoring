import { useState, useEffect } from 'react'
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
} from '@heroui/react'
import type { Server } from '@/types/server'

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
    docker_mode: false,
    environment: 'production',
    os: '',
    status: 'online',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && server) {
      setFormData({
        name: server.name || '',
        host: server.host || '',
        ip: server.ip || '',
        docker_mode: server.docker_mode || false,
        environment: server.environment || 'production',
        os: server.os || '',
        status: server.status || 'online',
      })
    } else if (!isOpen) {
      setFormData({
        name: '',
        host: '',
        ip: '',
        docker_mode: false,
        environment: 'production',
        os: '',
        status: 'online',
      })
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
                      formData.environment && ['production', 'staging', 'development', 'testing'].includes(formData.environment)
                        ? new Set([formData.environment])
                        : new Set()
                    }
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string
                      if (value && ['production', 'staging', 'development', 'testing'].includes(value)) {
                        setFormData((prev) => ({ ...prev, environment: value }))
                      }
                    }}
                    isRequired
                    isDisabled={loading}
                    aria-label="Server environment"
                  >
                    <SelectItem key="production">Production</SelectItem>
                    <SelectItem key="staging">Staging</SelectItem>
                    <SelectItem key="development">Development</SelectItem>
                    <SelectItem key="testing">Testing</SelectItem>
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
                    selectedKeys={formData.docker_mode ? ['enabled'] : ['disabled']}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0]
                      setFormData((prev) => ({ ...prev, docker_mode: value === 'enabled' }))
                    }}
                    isDisabled={loading}
                    aria-label="Docker mode"
                  >
                    <SelectItem key="enabled">Enabled</SelectItem>
                    <SelectItem key="disabled">Disabled</SelectItem>
                  </Select>
                </div>
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
                isDisabled={!formData.name?.trim()}
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

