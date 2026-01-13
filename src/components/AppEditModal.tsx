import { useState, useEffect } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Switch,
} from '@heroui/react'
import { useServers } from '@/features/servers/hooks/useServers'
import type { ServerApp } from '@/features/apps/types'

interface AppEditModalProps {
  isOpen: boolean
  onClose: () => void
  app: ServerApp | null
  onSave: (payload: Partial<ServerApp>) => Promise<void>
}

export function AppEditModal({
  isOpen,
  onClose,
  app,
  onSave,
}: AppEditModalProps) {
  const { servers } = useServers({})
  const [formData, setFormData] = useState<Partial<ServerApp>>({
    name: '',
    key: '',
    department: '',
    server: '',
    port: '',
    environment: '',
    repo_url: '',
    tech_stack: '',
    created_by: '',
    path: '',
    status: '',
    docker_mode: false,
    backup_enabled: false,
    backup_frequency: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && app) {
      setFormData({
        name: app.name || '',
        key: app.key || '',
        department: app.department || '',
        server: app.server || '',
        port: app.port || '',
        environment: app.environment || '',
        repo_url: app.repo_url || '',
        tech_stack: app.tech_stack || '',
        created_by: app.created_by || '',
        path: app.path || '',
        status: app.status || '',
        docker_mode: app.docker_mode || false,
        backup_enabled: app.backup_enabled || false,
        backup_frequency: app.backup_frequency || '',
        notes: app.notes || '',
      })
    } else if (!isOpen) {
      setFormData({
        name: '',
        key: '',
        department: '',
        server: '',
        port: '',
        environment: '',
        repo_url: '',
        tech_stack: '',
        created_by: '',
        path: '',
        status: '',
        docker_mode: false,
        backup_enabled: false,
        backup_frequency: '',
        notes: '',
      })
    }
  }, [isOpen, app])

  const handleSubmit = async () => {
    if (!app) return

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
              Edit App
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-default-700">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      id="edit-app-key"
                      name="key"
                      label="App Key"
                      placeholder="e.g. app-001"
                      value={formData.key || ''}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, key: value }))
                      }
                      isDisabled={loading}
                    />

                    <Input
                      id="edit-app-name"
                      name="name"
                      label="Name"
                      placeholder="Enter app name"
                      value={formData.name || ''}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, name: value }))
                      }
                      isRequired
                      isDisabled={loading}
                      autoFocus
                    />

                    <Input
                      id="edit-app-department"
                      name="department"
                      label="Department"
                      placeholder="Enter department"
                      value={formData.department || ''}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, department: value }))
                      }
                      isDisabled={loading}
                    />

                    <Select
                      id="edit-app-server"
                      name="server"
                      label="Server"
                      placeholder="Select server"
                      selectedKeys={
                        formData.server && servers.some(s => s.id === formData.server)
                          ? new Set([formData.server])
                          : new Set()
                      }
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string
                        if (value) setFormData((prev) => ({ ...prev, server: value }))
                      }}
                      isDisabled={loading}
                      aria-label="Server"
                    >
                      {servers.map((server) => (
                        <SelectItem key={server.id}>
                          {server.name || server.id}
                        </SelectItem>
                      ))}
                    </Select>

                    <Input
                      id="edit-app-port"
                      name="port"
                      label="Port"
                      placeholder="Enter port number"
                      value={String(formData.port || '')}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, port: value }))
                      }
                      isDisabled={loading}
                    />

                    <Select
                      id="edit-app-environment"
                      name="environment"
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
                          setFormData((prev) => ({ ...prev, environment: value }))
                        }
                      }}
                      isDisabled={loading}
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
                      id="edit-app-tech-stack"
                      name="tech_stack"
                      label="Tech Stack"
                      placeholder="e.g. React, Node.js, PostgreSQL"
                      value={formData.tech_stack || ''}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, tech_stack: value }))
                      }
                      isDisabled={loading}
                    />

                    <Select
                      id="edit-app-status"
                      name="status"
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
                          setFormData((prev) => ({ ...prev, status: value }))
                        }
                      }}
                      isDisabled={loading}
                      aria-label="Status"
                    >
                      <SelectItem key="online">Online</SelectItem>
                      <SelectItem key="offline">Offline</SelectItem>
                      <SelectItem key="running">Running</SelectItem>
                      <SelectItem key="stopped">Stopped</SelectItem>
                      <SelectItem key="maintenance">Maintenance</SelectItem>
                    </Select>

                    <Select
                      id="edit-app-docker-mode"
                      name="docker_mode"
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
                          setFormData((prev) => ({ ...prev, docker_mode: value }))
                        }
                      }}
                      isDisabled={loading}
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
                    id="edit-app-repo-url"
                    name="repo_url"
                    label="Repo URL"
                    placeholder="https://github.com/user/repo"
                    value={formData.repo_url || ''}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, repo_url: value }))
                    }
                    isDisabled={loading}
                  />
                </div>

                {/* Backup Configuration */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-default-700">Backup Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Switch
                      id="edit-app-backup-enabled"
                      isSelected={formData.backup_enabled || false}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, backup_enabled: value }))
                      }
                      isDisabled={loading}
                    >
                      Backup Enabled
                    </Switch>

                    {formData.backup_enabled && (
                      <Select
                        id="edit-app-backup-frequency"
                        name="backup_frequency"
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
                            setFormData((prev) => ({ ...prev, backup_frequency: value }))
                          }
                        }}
                        isDisabled={loading}
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

                {/* Notes - Full width */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-default-700">Notes</h4>
                  <Textarea
                    id="edit-app-notes"
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

