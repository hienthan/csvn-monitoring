import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardBody,
  Input,
  Textarea,
  Select,
  SelectItem,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
} from '@heroui/react'
import { ArrowLeft, Plus, X } from 'lucide-react'
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
import { useAuth } from '@/features/auth/context/AuthContext'

import { PageContainer } from '@/components/PageContainer'

function TicketCreatePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { handleError } = useApiError()
  const [loading, setLoading] = useState(false)
  const [codeGenerating, setCodeGenerating] = useState(true)
  const [formData, setFormData] = useState<Partial<{
    code: string
    title: string
    description: string
    types: TicketType
    status: TicketStatus
    priority: TicketPriority
    environment: TicketEnvironment
    app_name: string
    service_tags: string[]
    requestor_name: string
    requestor_contact: string
    assignee: string
    due_at: string
    link: TicketLinks
  }>>({
    code: '',
    title: '',
    description: '',
    types: 'general',
    status: 'new',
    priority: 'normal',
    environment: 'dev',
    app_name: '',
    service_tags: [],
    requestor_name: user?.syno_username || user?.name || '',
    requestor_contact: user?.email || '',
    assignee: 'DevOps',
    due_at: '',
    link: [],
  })
  
  const [serviceTags, setServiceTags] = useState<string[]>([])
  const [customServiceTag, setCustomServiceTag] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [links, setLinks] = useState<Array<{ label: string; url: string }>>([])
  const [showDiscardModal, setShowDiscardModal] = useState(false)
  const initialFormDataRef = useRef<typeof formData | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const generateCode = async () => {
      try {
        setCodeGenerating(true)
        const code = await findAvailableTicketCode(pb)
        const initialData = { ...formData, code }
        setFormData(initialData)
        initialFormDataRef.current = JSON.parse(
          JSON.stringify({ ...initialData, service_tags: [], link: [] })
        )
      } catch (err: any) {
        const year = new Date().getFullYear()
        const fallbackCode = generateTicketCode(year, 1)
        const initialData = { ...formData, code: fallbackCode }
        setFormData(initialData)
        initialFormDataRef.current = JSON.parse(
          JSON.stringify({ ...initialData, service_tags: [], link: [] })
        )
        handleError(err)
      } finally {
        setCodeGenerating(false)
      }
    }
    generateCode()
  }, [handleError])

  useEffect(() => {
    if (!initialFormDataRef.current) return
    const currentData = JSON.stringify({ ...formData, link: links, service_tags: serviceTags })
    const initialData = JSON.stringify({
      ...initialFormDataRef.current,
      link: [],
      service_tags: [],
    })
    setHasChanges(currentData !== initialData)
  }, [formData, links, serviceTags])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const normalizedTitle = formData.title?.trim()
    const normalizedType = formData.types || 'general'
    const normalizedEnv = formData.environment || 'dev'
    if (!normalizedTitle) return
    setLoading(true)
    try {
      const linksData =
        links.length > 0
          ? links.filter((link) => link.url.trim()).map((link) => ({
              label: link.label || '',
              url: link.url,
            }))
          : undefined
      const ticket = await createTicket(
        {
          ...formData,
          title: normalizedTitle,
          types: normalizedType,
          environment: normalizedEnv,
          service_tags: serviceTags,
          link: linksData,
        } as any,
        attachments.length > 0 ? attachments : undefined
      )
      await addEvent({ 
        ticket: ticket.id, 
        event_type: 'note', 
        actor_name: formData.requestor_name || 'System', 
        note: 'ticket_created' 
      })
      navigate(`/tickets/${ticket.id}`)
    } catch (err: any) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => setFormData((prev) => ({ ...prev, [field]: value }))

  const handleCancel = () => {
    if (hasChanges) setShowDiscardModal(true)
    else navigate('/tickets')
  }

  const handleDiscardConfirm = () => {
    setShowDiscardModal(false)
    navigate('/tickets')
  }

  return (
    <PageContainer className="py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-divider pb-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              variant="flat"
              onPress={handleCancel}
              aria-label="Back to tickets"
              size="sm"
            >
              <ArrowLeft size={16} />
            </Button>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Create New Ticket
            </h1>
          </div>
          <p className="text-default-500 font-medium">Standardize your infrastructure requests</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="flat"
            onPress={handleCancel}
            isDisabled={loading}
            className="font-semibold"
          >
            Discard
          </Button>
          <Button
            type="submit"
            form="ticket-create-form"
            color="primary"
            variant="shadow"
            isLoading={loading}
            isDisabled={loading || codeGenerating}
            className="font-bold px-8"
          >
            Submit Ticket
          </Button>
        </div>
      </div>

      <Card shadow="sm" className="border-none bg-content1 p-8">
        <CardBody className="p-0">
          <form id="ticket-create-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Ticket Code"
                placeholder="Generating..."
                value={formData.code}
                isReadOnly
                variant="flat"
              />
              <Input
                label="Title"
                placeholder="Brief summary"
                value={formData.title}
                onValueChange={(v: string) => handleChange('title', v)}
                isRequired
                variant="flat"
              />
            </div>

            <Textarea
              label="Description"
              placeholder="Detailed explanation (Markdown supported)"
              value={formData.description}
              onValueChange={(v: string) => handleChange('description', v)}
              minRows={6}
              isRequired
              variant="flat"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Select
                label="Type"
                selectedKeys={formData.types ? [formData.types] : []}
                onSelectionChange={(keys: any) => handleChange('types', Array.from(keys)[0])}
                variant="flat"
              >
                {Object.entries(TICKET_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k}>{v}</SelectItem>
                ))}
              </Select>
              <Select
                label="Priority"
                selectedKeys={formData.priority ? [formData.priority] : []}
                onSelectionChange={(keys: any) => handleChange('priority', Array.from(keys)[0])}
                variant="flat"
              >
                <SelectItem key="low">Low</SelectItem>
                <SelectItem key="normal">Normal</SelectItem>
                <SelectItem key="high">High</SelectItem>
                <SelectItem key="urgent">Urgent</SelectItem>
              </Select>
              <Select
                label="Environment"
                selectedKeys={formData.environment ? [formData.environment] : []}
                onSelectionChange={(keys: any) => handleChange('environment', Array.from(keys)[0])}
                variant="flat"
              >
                {Object.entries(TICKET_ENVIRONMENT_LABELS).map(([k, v]) => (
                  <SelectItem key={k}>{v}</SelectItem>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="App Name"
                placeholder="e.g. user-service"
                value={formData.app_name}
                onValueChange={(v: string) => handleChange('app_name', v)}
                variant="flat"
              />
              <Input
                label="Requestor"
                placeholder="Your name"
                value={formData.requestor_name}
                onValueChange={(v: string) => handleChange('requestor_name', v)}
                variant="flat"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Requestor Contact"
                placeholder="Email or phone (optional)"
                value={formData.requestor_contact}
                onValueChange={(v: string) => handleChange('requestor_contact', v)}
                variant="flat"
              />
              <Input
                label="Assignee"
                placeholder="Assignee name or ID (optional)"
                value={formData.assignee}
                onValueChange={(v: string) => handleChange('assignee', v)}
                variant="flat"
                isReadOnly
              />
            </div>

            <Input
              label="Due Date"
              type="datetime-local"
              placeholder="Select due date (optional)"
              value={formData.due_at ? new Date(formData.due_at).toISOString().slice(0, 16) : ''}
              onValueChange={(value) => {
                if (value) {
                  const date = new Date(value)
                  handleChange('due_at', date.toISOString())
                } else {
                  handleChange('due_at', undefined)
                }
              }}
              variant="flat"
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
                  variant="flat"
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
                  variant="flat"
                  aria-label="Custom service tag"
                />
              </div>
            </div>

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
                      variant="flat"
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
                      variant="flat"
                      className="flex-2"
                      aria-label={`Link URL ${index + 1}`}
                    />
                    <Button
                      isIconOnly
                      variant="light"
                      color="danger"
                      onPress={() => setLinks(links.filter((_, i) => i !== index))}
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
          </form>
        </CardBody>
      </Card>

      <Modal isOpen={showDiscardModal} onClose={() => setShowDiscardModal(false)}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Discard changes?</ModalHeader>
              <ModalBody>You have unsaved changes. Are you sure you want to leave?</ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Stay</Button>
                <Button color="danger" onPress={handleDiscardConfirm}>Discard</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </PageContainer>
  )
}

export default TicketCreatePage
