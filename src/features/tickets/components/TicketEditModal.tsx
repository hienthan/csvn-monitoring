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
  Chip,
} from '@heroui/react'
import { Plus, X } from 'lucide-react'
import type {
  Ticket,
  TicketPriority,
  TicketType,
  TicketEnvironment,
} from '../types'
import {
  TICKET_TYPE_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_ENVIRONMENT_LABELS,
  SERVICE_TAG_OPTIONS,
} from '../constants'
import { parseLinks } from '../utils'

interface TicketEditModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: Ticket | null
  onSave: (payload: Partial<Ticket>, attachmentsFiles?: File[]) => Promise<void>
}

export function TicketEditModal({
  isOpen,
  onClose,
  ticket,
  onSave,
}: TicketEditModalProps) {
  const [formData, setFormData] = useState<Partial<Ticket>>({
    title: '',
    description: '',
    type: 'deploy_bugfix',
    priority: 'normal',
    environment: 'dev',
    app_name: '',
    requester_name: '',
    requester_contact: '',
    assignee: '',
    due_at: '',
  })
  const [links, setLinks] = useState<Array<{ label: string; url: string }>>([])
  const [serviceTags, setServiceTags] = useState<string[]>([])
  const [customServiceTag, setCustomServiceTag] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [actorName, setActorName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && ticket) {
      setFormData({
        title: ticket.title || '',
        description: ticket.description || '',
        type: ticket.type || 'deploy_bugfix',
        priority: ticket.priority || 'normal',
        environment: ticket.environment || 'dev',
        app_name: ticket.app_name || '',
        requester_name: ticket.requester_name || '',
        requester_contact: ticket.requester_contact || '',
        assignee: ticket.assignee || '',
        due_at: ticket.due_at || '',
      })
      setServiceTags(Array.isArray(ticket.service_tags) ? ticket.service_tags : [])
      const parsedLinks = parseLinks(ticket.links)
      setLinks(
        parsedLinks.map((link) => ({
          label: link.label || '',
          url: link.url,
        }))
      )
      setAttachments([])
      setActorName(ticket.assignee || ticket.requester_name || 'DevOps')
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        title: '',
        description: '',
        type: 'deploy_bugfix',
        priority: 'normal',
        environment: 'dev',
        app_name: '',
        requester_name: '',
        requester_contact: '',
        assignee: '',
        due_at: '',
      })
      setServiceTags([])
      setLinks([])
      setAttachments([])
      setActorName('')
    }
  }, [isOpen, ticket])

  const handleSubmit = async () => {
    if (!ticket) return

    setLoading(true)
    try {
      // Prepare links as JSON array
      const linksData =
        links.length > 0
          ? links.filter((link) => link.url.trim()).map((link) => ({
              label: link.label || '',
              url: link.url,
            }))
          : undefined

      // Calculate changed fields
      const changedFields: string[] = []
      if (formData.title !== ticket.title) changedFields.push('title')
      if (formData.description !== ticket.description) changedFields.push('description')
      if (formData.type !== ticket.type) changedFields.push('type')
      if (formData.priority !== ticket.priority) changedFields.push('priority')
      if (formData.environment !== ticket.environment) changedFields.push('environment')
      if (formData.app_name !== ticket.app_name) changedFields.push('app_name')
      const ticketServiceTags = Array.isArray(ticket.service_tags) ? ticket.service_tags : []
      if (JSON.stringify(serviceTags) !== JSON.stringify(ticketServiceTags)) {
        changedFields.push('service_tags')
      }
      if (formData.requester_name !== ticket.requester_name) changedFields.push('requester_name')
      if (formData.requester_contact !== ticket.requester_contact) {
        changedFields.push('requester_contact')
      }
      if (formData.assignee !== ticket.assignee) changedFields.push('assignee')
      if (formData.due_at !== ticket.due_at) changedFields.push('due_at')
      if (JSON.stringify(linksData) !== JSON.stringify(ticket.links)) changedFields.push('links')

      const payload: Partial<Ticket> = {
        ...formData,
        service_tags: serviceTags,
        links: linksData,
      }

      // Add actorName to payload for event logging
      const payloadWithActor = { ...payload, actorName } as any
      await onSave(payloadWithActor, attachments.length > 0 ? attachments : undefined)
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
      isDismissable={!loading}
      isKeyboardDismissDisabled={loading}
      classNames={{
        base: "z-[100]",
        backdrop: "z-[90]",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Edit Ticket
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  id="edit-ticket-title"
                  name="title"
                  label="Title"
                  placeholder="Enter ticket title"
                  value={formData.title || ''}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, title: value }))
                  }
                  isRequired
                  isDisabled={loading}
                  autoFocus
                />

                <Textarea
                  id="edit-ticket-description"
                  name="description"
                  label="Description"
                  placeholder="Enter ticket description"
                  value={formData.description || ''}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, description: value }))
                  }
                  minRows={5}
                  isDisabled={loading}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    id="edit-ticket-type"
                    name="type"
                    label="Type"
                    placeholder="Select type"
                    selectedKeys={formData.type ? new Set([formData.type]) : new Set()}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as TicketType
                      if (value) setFormData((prev) => ({ ...prev, type: value }))
                    }}
                    isRequired
                    isDisabled={loading}
                    aria-label="Ticket type"
                  >
                    {Object.entries(TICKET_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key}>{label}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    id="edit-ticket-priority"
                    name="priority"
                    label="Priority"
                    placeholder="Select priority"
                    selectedKeys={formData.priority ? new Set([formData.priority]) : new Set()}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as TicketPriority
                      if (value) setFormData((prev) => ({ ...prev, priority: value }))
                    }}
                    isRequired
                    isDisabled={loading}
                    aria-label="Ticket priority"
                  >
                    {Object.entries(TICKET_PRIORITY_LABELS).map(([key, label]) => (
                      <SelectItem key={key}>{label}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    id="edit-ticket-environment"
                    name="environment"
                    label="Environment"
                    placeholder="Select environment"
                    selectedKeys={
                      formData.environment &&
                      Object.keys(TICKET_ENVIRONMENT_LABELS).includes(formData.environment)
                        ? new Set([formData.environment])
                        : new Set()
                    }
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as TicketEnvironment
                      if (value) setFormData((prev) => ({ ...prev, environment: value }))
                    }}
                    isRequired
                    isDisabled={loading}
                    aria-label="Ticket environment"
                  >
                    {Object.entries(TICKET_ENVIRONMENT_LABELS).map(([key, label]) => (
                      <SelectItem key={key}>{label}</SelectItem>
                    ))}
                  </Select>

                  <Input
                    id="edit-ticket-due-at"
                    name="due_at"
                    type="datetime-local"
                    label="Due Date"
                    placeholder="Select due date (optional)"
                    value={
                      formData.due_at
                        ? new Date(formData.due_at).toISOString().slice(0, 16)
                        : ''
                    }
                    onValueChange={(value) => {
                      if (value) {
                        const date = new Date(value)
                        setFormData((prev) => ({ ...prev, due_at: date.toISOString() }))
                      } else {
                        setFormData((prev) => ({ ...prev, due_at: undefined }))
                      }
                    }}
                    isDisabled={loading}
                  />
                </div>

                <Input
                  id="edit-ticket-app-name"
                  name="app_name"
                  label="App Name"
                  placeholder="Enter app name"
                  value={formData.app_name || ''}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, app_name: value }))
                  }
                  isRequired
                  isDisabled={loading}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {serviceTags.map((tag) => (
                      <Chip
                        key={tag}
                        onClose={() => setServiceTags(serviceTags.filter((t) => t !== tag))}
                        variant="flat"
                        color="primary"
                      >
                        {tag}
                      </Chip>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Select
                      placeholder="Add service tag"
                      selectedKeys={new Set()}
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string
                        if (value && !serviceTags.includes(value)) {
                          setServiceTags([...serviceTags, value])
                        }
                      }}
                      isDisabled={loading}
                      aria-label="Add service tag"
                    >
                      {SERVICE_TAG_OPTIONS.filter((tag) => !serviceTags.includes(tag)).map(
                        (tag) => (
                          <SelectItem key={tag}>{tag}</SelectItem>
                        )
                      )}
                    </Select>
                    <Input
                      placeholder="Custom tag"
                      value={customServiceTag}
                      onValueChange={setCustomServiceTag}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && customServiceTag.trim()) {
                          e.preventDefault()
                          if (!serviceTags.includes(customServiceTag.trim())) {
                            setServiceTags([...serviceTags, customServiceTag.trim()])
                          }
                          setCustomServiceTag('')
                        }
                      }}
                      isDisabled={loading}
                      aria-label="Custom service tag"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="edit-ticket-requester-name"
                    name="requester_name"
                    label="Requester Name"
                    placeholder="Enter requester name"
                    value={formData.requester_name || ''}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, requester_name: value }))
                    }
                    isRequired
                    isDisabled={loading}
                  />

                  <Input
                    id="edit-ticket-requester-contact"
                    name="requester_contact"
                    label="Requester Contact"
                    placeholder="Enter requester contact (optional)"
                    value={formData.requester_contact || ''}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, requester_contact: value }))
                    }
                    isDisabled={loading}
                  />
                </div>

                <Input
                  id="edit-ticket-assignee"
                  name="assignee"
                  label="Assignee"
                  placeholder="Enter assignee name or ID (optional)"
                  value={formData.assignee || ''}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, assignee: value }))
                  }
                  isDisabled={loading}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Links (optional)</label>
                  <div className="space-y-2">
                    {links.map((link, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <Input
                          placeholder="Label (optional)"
                          value={link.label}
                          onValueChange={(value) => {
                            const newLinks = [...links]
                            newLinks[index].label = value
                            setLinks(newLinks)
                          }}
                          isDisabled={loading}
                          className="flex-1"
                          aria-label={`Link label ${index + 1}`}
                        />
                        <Input
                          placeholder="URL"
                          value={link.url}
                          onValueChange={(value) => {
                            const newLinks = [...links]
                            newLinks[index].url = value
                            setLinks(newLinks)
                          }}
                          isDisabled={loading}
                          className="flex-2"
                          aria-label={`Link URL ${index + 1}`}
                        />
                        <Button
                          isIconOnly
                          variant="light"
                          color="danger"
                          onPress={() => setLinks(links.filter((_, i) => i !== index))}
                          isDisabled={loading}
                          aria-label="Remove link"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="bordered"
                      startContent={<Plus size={16} />}
                      onPress={() => setLinks([...links, { label: '', url: '' }])}
                      isDisabled={loading}
                      className="w-full"
                    >
                      Add Link
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Attachments (optional)</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        setAttachments(Array.from(e.target.files))
                      }
                    }}
                    disabled={loading}
                    className="text-sm w-full"
                  />
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {attachments.map((file, index) => (
                        <Chip
                          key={index}
                          onClose={() =>
                            setAttachments(attachments.filter((_, i) => i !== index))
                          }
                          variant="flat"
                          size="sm"
                        >
                          {file.name}
                        </Chip>
                      ))}
                    </div>
                  )}
                </div>

                <Input
                  id="edit-ticket-actor-name"
                  name="actorName"
                  label="Actor Name (for event log)"
                  placeholder="Enter actor name"
                  value={actorName || ''}
                  onValueChange={setActorName}
                  isRequired
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
                isDisabled={!formData.title?.trim() || !actorName?.trim()}
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

