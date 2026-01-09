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
} from '@heroui/react'
import { Send, Download, ExternalLink, File } from 'lucide-react'
import { useTicketComments } from '../hooks/useTicketComments'
import { useTicket } from '../hooks/useTicket'
import { useApiError } from '@/lib/hooks/useApiError'
import { pbFilesUrls } from '../utils'
import { EmptyState } from '@/components/EmptyState'

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

  return (
    <div className="space-y-6">
      {/* Add Comment Form */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Add Comment</h2>
        </CardHeader>
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
                Post Comment
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Comments Timeline */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">
            Comments ({comments.length})
          </h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-20 w-full rounded" />
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <EmptyState
              title="No comments yet"
              description="Be the first to add a comment"
            />
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => {
                const attachmentUrls = comment.attachments
                  ? pbFilesUrls('ma_ticket_comments', comment.id, comment.attachments)
                  : []

                return (
                  <div
                    key={comment.id}
                    className="border-l-4 border-primary pl-4 py-2 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {comment.author_name || 'Anonymous'}
                        </p>
                        <span className="text-xs text-default-500">
                          {formatDate(comment.created)}
                        </span>
                      </div>
                    </div>
                    <p className="text-default-700 whitespace-pre-wrap">
                      {comment.message || ''}
                    </p>
                    {attachmentUrls.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {attachmentUrls.map((url, index) => {
                          const fileName = comment.attachments?.[index] || `file-${index}`
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-default-100 rounded text-sm"
                            >
                              <File size={16} className="text-default-500" />
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
                                >
                                  <Download size={14} />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default TicketCommentsTab
