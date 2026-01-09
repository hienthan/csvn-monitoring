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
} from '@heroui/react'
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
    actorName: string
    note?: string
    clearResolvedAt?: boolean
  }) => Promise<void>
}

export function StatusChangeModal({
  isOpen,
  onClose,
  currentStatus,
  newStatus,
  assignee,
  hasResolvedAt,
  onConfirm,
}: StatusChangeModalProps) {
  const [actorName, setActorName] = useState(assignee || 'DevOps')
  const [note, setNote] = useState('')
  const [clearResolvedAt, setClearResolvedAt] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setActorName(assignee || 'DevOps')
      setNote('')
      setClearResolvedAt(false)
    }
  }, [isOpen, assignee])

  const handleSubmit = async () => {
    if (!actorName.trim()) return

    setLoading(true)
    try {
      await onConfirm({
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

  const needsResolvedAtClear =
    hasResolvedAt &&
    (currentStatus === 'done' || currentStatus === 'rejected') &&
    newStatus === 'in_progress'

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
                <div>
                  <p className="text-sm text-default-600">
                    Changing status from{' '}
                    <span className="font-semibold">
                      {TICKET_STATUS_LABELS[currentStatus]}
                    </span>{' '}
                    to{' '}
                    <span className="font-semibold">
                      {TICKET_STATUS_LABELS[newStatus]}
                    </span>
                  </p>
                </div>

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
                color="primary"
                onPress={handleSubmit}
                isLoading={loading}
                isDisabled={!actorName.trim()}
              >
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

