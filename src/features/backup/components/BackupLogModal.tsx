import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Code,
} from '@heroui/react'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { copyToClipboard } from '@/lib/utils/clipboard'
import type { Backup } from '../types'

interface BackupLogModalProps {
  isOpen: boolean
  onClose: () => void
  backup: Backup | null
}

export function BackupLogModal({ isOpen, onClose, backup }: BackupLogModalProps) {
  const [copied, setCopied] = useState(false)

  if (!backup) return null

  const appName = backup.expand?.app_id?.name || backup.app_id
  const targetName = backup.name

  const handleCopyError = async () => {
    if (backup.last_error_summary) {
      const success = await copyToClipboard(backup.last_error_summary)
      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  const handleCopyLogPath = async () => {
    if (backup.last_log_path) {
      const success = await copyToClipboard(backup.last_log_path)
      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      placement="center"
      scrollBehavior="inside"
      classNames={{
        base: 'z-50',
        backdrop: 'z-40',
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-sm font-normal text-default-500">
                    {appName} / {targetName}
                  </p>
                  <p className="text-lg font-semibold">Backup Log</p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {backup.last_error_summary && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Error Summary</p>
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onPress={handleCopyError}
                        aria-label="Copy error"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <Code
                      className="w-full p-3 text-xs bg-content2 border border-divider"
                      radius="sm"
                    >
                      <pre className="whitespace-pre-wrap break-words">
                        {backup.last_error_summary}
                      </pre>
                    </Code>
                  </div>
                )}

                {backup.last_log_path && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Log Path</p>
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onPress={handleCopyLogPath}
                        aria-label="Copy log path"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <Code
                      className="w-full p-3 text-xs bg-content2 border border-divider"
                      radius="sm"
                    >
                      {backup.last_log_path}
                    </Code>
                    <p className="text-xs text-default-500">
                      Note: Full log content is stored on the server. This path points to the log file.
                    </p>
                  </div>
                )}

                {!backup.last_error_summary && !backup.last_log_path && (
                  <p className="text-sm text-default-500">No log information available.</p>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
