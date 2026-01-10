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
  Checkbox,
  Alert,
  Select,
  SelectItem,
} from '@heroui/react'
import { AlertCircle } from 'lucide-react'
import type { TicketStatus } from '../types'
import { TICKET_STATUS_LABELS } from '../constants'

interface StatusChangeModalProps {
  isOpen: boolean
  onClose: () => void
  currentStatus: TicketStatus
  newStatus: TicketStatus
  assignee?: string
  hasResolvedAt: boolean
  onConfirm: (params: {
    newStatus: TicketStatus
    actorName: string
    note?: string
    clearResolvedAt?: boolean
  }) => Promise<void>
  onStatusChange?: (status: TicketStatus) => void
}

export function StatusChangeModal({
  isOpen,
  onClose,
  currentStatus,
  newStatus: initialNewStatus,
  assignee,
  hasResolvedAt,
  onConfirm,
  onStatusChange,
}: StatusChangeModalProps) {
  const [selectedNewStatus, setSelectedNewStatus] = useState<TicketStatus>(initialNewStatus)
  const [actorName, setActorName] = useState(assignee || 'DevOps')
  const [note, setNote] = useState('')
  const [clearResolvedAt, setClearResolvedAt] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSelectedNewStatus(initialNewStatus)
      setActorName(assignee || 'DevOps')
      setNote('')
      setClearResolvedAt(false)
    }
  }, [isOpen, assignee, initialNewStatus])

  const handleStatusSelect = (status: TicketStatus) => {
    setSelectedNewStatus(status)
    if (onStatusChange) {
      onStatusChange(status)
    }
  }

  const handleSubmit = async () => {
    if (!actorName.trim()) return

    setLoading(true)
    try {
      await onConfirm({
        newStatus: selectedNewStatus,
        actorName: actorName.trim(),
        note: note.trim() || undefined,
        clearResolvedAt: clearResolvedAt,
      })
      // Don't close here - let parent handle it after refetch
    } catch (error) {
      // Error handling is done in parent
      setLoading(false)
    }
  }

  const allStatuses: TicketStatus[] = [
    'new',
    'triage',
    'in_progress',
    'waiting_dev',
    'blocked',
    'done',
    'rejected',
  ]

  const needsResolvedAtClear =
    hasResolvedAt &&
    (currentStatus === 'done' || currentStatus === 'rejected') &&
    selectedNewStatus === 'in_progress'

  const isClosingStatus = selectedNewStatus === 'done' || selectedNewStatus === 'rejected'

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg"
      placement="center"
      scrollBehavior="inside"
      classNames={{
        base: "z-50",
        backdrop: "z-40",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Change Status
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {isClosingStatus && (
                  <Alert
                    color="warning"
                    variant="flat"
                    title="Confirm Status Change"
                    startContent={<AlertCircle size={20} />}
                  >
                    You are about to change this ticket to a final status ({TICKET_STATUS_LABELS[selectedNewStatus]}). 
                    This action will mark the ticket as resolved or closed. Please confirm this is correct.
                  </Alert>
                )}
                <div>
                  <p className="text-sm text-default-600 mb-2">
                    Current status:{' '}
                    <span className="font-semibold">
                      {TICKET_STATUS_LABELS[currentStatus]}
                    </span>
                  </p>
                </div>

                <Select
                  label="New Status"
                  placeholder="Select new status"
                  selectedKeys={selectedNewStatus ? new Set([selectedNewStatus]) : new Set()}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as TicketStatus
                    if (value) {
                      handleStatusSelect(value)
                    }
                  }}
                  isRequired
                  isDisabled={loading}
                  selectionMode="single"
                >
                  {allStatuses
                    .filter((status) => status !== currentStatus)
                    .map((status) => (
                      <SelectItem key={status} textValue={TICKET_STATUS_LABELS[status]}>
                        {TICKET_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                </Select>

                {selectedNewStatus !== currentStatus && (
                  <div>
                    <p className="text-sm text-default-600">
                      Changing to:{' '}
                      <span className="font-semibold">
                        {TICKET_STATUS_LABELS[selectedNewStatus]}
                      </span>
                    </p>
                  </div>
                )}

            <Input
              id="status-change-actor-name"
              name="actorName"
              label="Actor Name"
              placeholder="Enter actor name"
              value={actorName}
              onValueChange={setActorName}
              isRequired
              isDisabled={loading}
              autoFocus
            />

            <Textarea
              id="status-change-note"
              name="note"
              label="Note (optional)"
              placeholder="Add a note about this status change"
              value={note}
              onValueChange={setNote}
              minRows={3}
              isDisabled={loading}
            />

            {needsResolvedAtClear && (
              <Checkbox
                id="status-change-clear-resolved"
                name="clearResolvedAt"
                isSelected={clearResolvedAt}
                onValueChange={setClearResolvedAt}
                isDisabled={loading}
              >
                Clear resolved_at date
              </Checkbox>
            )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} isDisabled={loading}>
                Cancel
              </Button>
              <Button
                color={isClosingStatus ? 'warning' : 'primary'}
                onPress={handleSubmit}
                isLoading={loading}
                isDisabled={!actorName.trim()}
              >
                {isClosingStatus ? 'Confirm & Save' : 'Save'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

