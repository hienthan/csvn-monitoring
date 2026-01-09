import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
  Select,
  SelectItem,
  Button,
  Chip,
} from '@heroui/react'
import { ArrowLeft, Save, Plus, X } from 'lucide-react'
import { createTicket } from '../services/tickets.service'
import { addEvent } from '../services/events.service'
import { useApiError } from '@/lib/hooks/useApiError'
import type {
  TicketPriority,
  TicketStatus,
  TicketType,
  TicketEnvironment,
  TicketLinks,
} from '../types'
import {
  TICKET_TYPE_LABELS,
  TICKET_ENVIRONMENT_LABELS,
  SERVICE_TAG_OPTIONS,
} from '../constants'
import { findAvailableTicketCode, generateTicketCode } from '../utils'
import pb from '@/lib/pb'

function TicketCreatePage() {
  const navigate = useNavigate()
  const { handleError } = useApiError()
  const [loading, setLoading] = useState(false)
  const [codeGenerating, setCodeGenerating] = useState(true)
  const [formData, setFormData] = useState<Partial<{
    code: string
    title: string
    description: string
    type: TicketType
    status: TicketStatus
    priority: TicketPriority
    environment: TicketEnvironment
    app_name: string
    service_tags: string[]
    requester_name: string
    requester_contact: string
    assignee: string
    due_at: string
    links: TicketLinks
  }>>({
    code: '',
    title: '',
    description: '',
    type: 'deploy_bugfix',
    status: 'new',
    priority: 'normal',
    environment: 'dev',
    app_name: '',
    service_tags: [],
    requester_name: '',
    requester_contact: '',
    assignee: '',
    due_at: '',
    links: [],
  })
  const [customServiceTag, setCustomServiceTag] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [links, setLinks] = useState<Array<{ label: string; url: string }>>([])

  // Generate provisional code on page load
  useEffect(() => {
    const generateCode = async () => {
      try {
        setCodeGenerating(true)
        const code = await findAvailableTicketCode(pb)
        setFormData((prev) => ({ ...prev, code }))
      } catch (err) {
        // Fallback to a provisional code if generation fails
        const year = new Date().getFullYear()
        const fallbackCode = generateTicketCode(year, 1)
        setFormData((prev) => ({ ...prev, code: fallbackCode }))
        handleError(err)
      } finally {
        setCodeGenerating(false)
      }
    }

    generateCode()
  }, [handleError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.title?.trim()) {
      handleError(new Error('Title is required'))
      return
    }
    if (!formData.description?.trim()) {
      handleError(new Error('Description is required'))
      return
    }
    if (!formData.type) {
      handleError(new Error('Type is required'))
      return
    }
    if (!formData.priority) {
      handleError(new Error('Priority is required'))
      return
    }
    if (!formData.environment) {
      handleError(new Error('Environment is required'))
      return
    }
    if (!formData.app_name?.trim()) {
      handleError(new Error('App name is required'))
      return
    }
    if (!formData.requester_name?.trim()) {
      handleError(new Error('Requester name is required'))
      return
    }

    // Validate links
    const validLinks = links.filter((link) => link.url.trim())
    if (links.length > 0 && validLinks.length !== links.length) {
      handleError(new Error('All links must have a URL'))
      return
    }

    setLoading(true)

    try {
      // Ensure code is available before creating
      let finalCode = formData.code
      if (!finalCode) {
        finalCode = await findAvailableTicketCode(pb)
        setFormData((prev) => ({ ...prev, code: finalCode }))
      } else {
        // Re-validate code before submit (in case it was taken)
        // Start checking from the current code
        const validatedCode = await findAvailableTicketCode(pb, undefined, finalCode)
        if (validatedCode !== finalCode) {
          finalCode = validatedCode
          setFormData((prev) => ({ ...prev, code: finalCode }))
        }
      }

      // Prepare links as JSON array
      const linksData =
        validLinks.length > 0
          ? validLinks.map((link) => ({
              label: link.label || '',
              url: link.url,
            }))
          : undefined

      // Create ticket with attachments
      const ticket = await createTicket(
        {
          ...formData,
          code: finalCode,
          links: linksData,
        } as any,
        attachments.length > 0 ? attachments : undefined
      )

      // Create ticket_event for ticket creation
      await addEvent({
        ticket: ticket.id,
        event_type: 'note',
        actor_name: formData.requester_name || 'System',
        note: 'ticket_created',
      })

      navigate(`/tickets/${ticket.id}`)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          onPress={() => navigate('/tickets')}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-3xl font-bold">Create New Ticket</h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Ticket Information</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Code"
              placeholder="Generating..."
              value={formData.code || ''}
              isReadOnly
              isDisabled={loading || codeGenerating}
              description={codeGenerating ? 'Generating unique code...' : 'Auto-generated ticket code'}
            />

            <Input
              label="Title"
              placeholder="Enter ticket title"
              value={formData.title}
              onValueChange={(value) => handleChange('title', value)}
              isRequired
              isDisabled={loading}
            />

            <Textarea
              label="Description"
              placeholder="Enter ticket description (supports markdown)"
              value={formData.description}
              onValueChange={(value) => handleChange('description', value)}
              minRows={5}
              isRequired
              isDisabled={loading}
              description="Supports markdown formatting"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Type"
                placeholder="Select type"
                selectedKeys={formData.type ? [formData.type] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string
                  if (value) handleChange('type', value)
                }}
                isRequired
                isDisabled={loading}
              >
                {Object.entries(TICKET_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key}>{label}</SelectItem>
                ))}
              </Select>

              <Select
                label="Priority"
                placeholder="Select priority"
                selectedKeys={formData.priority ? [formData.priority] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string
                  if (value) handleChange('priority', value)
                }}
                isRequired
                isDisabled={loading}
              >
                <SelectItem key="low">Low</SelectItem>
                <SelectItem key="normal">Normal</SelectItem>
                <SelectItem key="high">High</SelectItem>
                <SelectItem key="urgent">Urgent</SelectItem>
              </Select>

              <Select
                label="Status"
                placeholder="Select status"
                selectedKeys={formData.status ? [formData.status] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string
                  if (value) handleChange('status', value)
                }}
                isDisabled={loading}
              >
                <SelectItem key="new">New</SelectItem>
                <SelectItem key="triage">Triage</SelectItem>
                <SelectItem key="in_progress">In Progress</SelectItem>
                <SelectItem key="waiting_dev">Waiting Dev</SelectItem>
                <SelectItem key="blocked">Blocked</SelectItem>
                <SelectItem key="done">Done</SelectItem>
                <SelectItem key="rejected">Rejected</SelectItem>
              </Select>

              <Select
                label="Environment"
                placeholder="Select environment"
                selectedKeys={formData.environment ? [formData.environment] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string
                  if (value) handleChange('environment', value)
                }}
                isRequired
                isDisabled={loading}
              >
                {Object.entries(TICKET_ENVIRONMENT_LABELS).map(([key, label]) => (
                  <SelectItem key={key}>{label}</SelectItem>
                ))}
              </Select>
            </div>

            <Input
              label="App Name"
              placeholder="Enter app name"
              value={formData.app_name}
              onValueChange={(value) => handleChange('app_name', value)}
              isRequired
              isDisabled={loading}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Service Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.service_tags?.map((tag) => (
                  <Chip
                    key={tag}
                    onClose={() => {
                      setFormData((prev) => ({
                        ...prev,
                        service_tags: prev.service_tags?.filter((t) => t !== tag) || [],
                      }))
                    }}
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
                  selectedKeys={[]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string
                    if (value && !formData.service_tags?.includes(value)) {
                      setFormData((prev) => ({
                        ...prev,
                        service_tags: [...(prev.service_tags || []), value],
                      }))
                    }
                  }}
                  isDisabled={loading}
                >
                  {SERVICE_TAG_OPTIONS.filter(
                    (tag) => !formData.service_tags?.includes(tag)
                  ).map((tag) => (
                    <SelectItem key={tag}>{tag}</SelectItem>
                  ))}
                </Select>
                <Input
                  placeholder="Custom tag"
                  value={customServiceTag}
                  onValueChange={setCustomServiceTag}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && customServiceTag.trim()) {
                      e.preventDefault()
                      if (!formData.service_tags?.includes(customServiceTag.trim())) {
                        setFormData((prev) => ({
                          ...prev,
                          service_tags: [...(prev.service_tags || []), customServiceTag.trim()],
                        }))
                      }
                      setCustomServiceTag('')
                    }
                  }}
                  isDisabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Requester Name"
                placeholder="Enter requester name"
                value={formData.requester_name}
                onValueChange={(value) => handleChange('requester_name', value)}
                isRequired
                isDisabled={loading}
              />

              <Input
                label="Requester Contact"
                placeholder="Enter requester contact (optional)"
                value={formData.requester_contact}
                onValueChange={(value) => handleChange('requester_contact', value)}
                isDisabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Assignee"
                placeholder="Enter assignee name or ID (optional)"
                value={formData.assignee}
                onValueChange={(value) => handleChange('assignee', value)}
                isDisabled={loading}
              />

              <Input
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
                    handleChange('due_at', date.toISOString())
                  } else {
                    handleChange('due_at', '')
                  }
                }}
                isDisabled={loading}
              />
            </div>

            {/* Attachments */}
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

            {/* Links Editor */}
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
                    />
                    <Input
                      placeholder="URL"
                      value={link.url}
                      onValueChange={(value) => {
                        const newLinks = [...links]
                        newLinks[index].url = value
                        setLinks(newLinks)
                      }}
                      isRequired
                      isDisabled={loading}
                      className="flex-2"
                    />
                    <Button
                      isIconOnly
                      variant="light"
                      color="danger"
                      onPress={() => setLinks(links.filter((_, i) => i !== index))}
                      isDisabled={loading}
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

            <div className="flex gap-4 justify-end">
              <Button
                variant="light"
                onPress={() => navigate('/tickets')}
                isDisabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                startContent={<Save size={16} />}
                isLoading={loading}
              >
                Create Ticket
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

export default TicketCreatePage

