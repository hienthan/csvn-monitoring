import { useState, useEffect } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Textarea,
  Button,
  Skeleton,
  Input,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react'
import { Send, Download, ExternalLink, File, User as UserIcon, MoreVertical } from 'lucide-react'
import { useTicketComments } from '../hooks/useTicketComments'
import { useTicket } from '../hooks/useTicket'
import { useApiError } from '@/lib/hooks/useApiError'
import { pbFilesUrls } from '../utils'
import { EmptyState } from '@/components/ui/EmptyState'

interface TicketCommentsTabProps {
  ticketId?: string
}

function TicketCommentsTab({ ticketId }: TicketCommentsTabProps) {
  const { ticket } = useTicket(ticketId)
  const { comments, loading, error, addComment } = useTicketComments({
    ticketId,
  })
  const { handleError } = useApiError()
  const [newComment, setNewComment] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Set default author name from ticket
  useEffect(() => {
    if (ticket && !authorName) {
      setAuthorName(ticket.assignee || ticket.requester_name || '')
    }
  }, [ticket, authorName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketId || !newComment.trim() || !authorName.trim()) return

    setSubmitting(true)
    try {
      await addComment({
        author_name: authorName.trim(),
        message: newComment.trim(),
        attachmentsFiles: attachments.length > 0 ? attachments : undefined,
      })
      setNewComment('')
      setAttachments([])
    } catch (err) {
      handleError(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files))
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'N/A'
    }
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <p className="text-danger">Error loading comments: {error.message}</p>
        </CardBody>
      </Card>
    )
  }

  // Helper component for User display
  const UserDisplay = ({ name }: { name: string }) => (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-default-200 flex items-center justify-center flex-shrink-0">
        <UserIcon size={16} className="text-default-500" />
      </div>
      <p className="font-medium text-sm text-default-900">{name}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Add Comment Form - Top */}
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="comment-author-name"
              name="authorName"
              label="Author Name"
              placeholder="Enter your name"
              value={authorName}
              onValueChange={setAuthorName}
              isRequired
              isDisabled={submitting}
            />
            <Textarea
              id="comment-message"
              name="message"
              label="Message"
              placeholder="Write a comment..."
              value={newComment}
              onValueChange={setNewComment}
              minRows={3}
              isRequired
              isDisabled={submitting}
            />
            <div>
              <label htmlFor="comment-attachments" className="text-sm font-medium mb-2 block">
                Attachments (optional)
              </label>
              <input
                id="comment-attachments"
                name="attachments"
                type="file"
                multiple
                onChange={handleFileChange}
                disabled={submitting}
                className="text-sm"
              />
              {attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
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
            <div className="flex justify-end">
              <Button
                type="submit"
                color="primary"
                startContent={<Send size={16} />}
                isLoading={submitting}
                isDisabled={!newComment.trim() || !authorName.trim()}
              >
                Add Comment
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Comments List - Below */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardBody>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded bg-content1" />
                  <Skeleton className="h-20 w-full rounded bg-content1" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              title="No comments yet"
              description="Be the first to add a comment"
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const attachmentUrls = comment.attachments
              ? pbFilesUrls('ma_ticket_comments', comment.id, comment.attachments)
              : []

            return (
              <Card key={comment.id}>
                <CardHeader className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <UserDisplay name={comment.author_name || 'Anonymous'} />
                    <span className="text-xs text-default-500">
                      {formatDate(comment.created)}
                    </span>
                  </div>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        aria-label="More options"
                      >
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Comment actions">
                      <DropdownItem key="edit">Edit</DropdownItem>
                      <DropdownItem key="delete" className="text-danger">
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </CardHeader>
                <CardBody className="pt-0">
                  <p className="text-default-700 whitespace-pre-wrap mb-3">
                    {comment.message || ''}
                  </p>
                  {attachmentUrls.length > 0 && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-divider">
                      {attachmentUrls.map((url, index) => {
                        const fileName = comment.attachments?.[index] || `file-${index}`
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-default-100 rounded text-sm"
                          >
                            <File size={16} className="text-default-500 flex-shrink-0" />
                            <span className="flex-1 truncate">{fileName}</span>
                            <div className="flex gap-1">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                as="a"
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Open file"
                              >
                                <ExternalLink size={14} />
                              </Button>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                as="a"
                                href={url}
                                download
                                aria-label="Download file"
                              >
                                <Download size={14} />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TicketCommentsTab
