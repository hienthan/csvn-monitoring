import { useState } from 'react'
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
import { Send } from 'lucide-react'
import { useTicketComments } from '../hooks/useTicketComments'
import { useApiError } from '@/lib/hooks/useApiError'

interface TicketCommentsTabProps {
  ticketId?: string
}

function TicketCommentsTab({ ticketId }: TicketCommentsTabProps) {
  const { comments, loading, error, addComment } = useTicketComments({
    ticketId,
  })
  const { handleError } = useApiError()
  const [newComment, setNewComment] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)

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
              label="Author Name"
              placeholder="Enter your name"
              value={authorName}
              onValueChange={setAuthorName}
              isRequired
              isDisabled={submitting}
            />
            <Textarea
              label="Message"
              placeholder="Write a comment..."
              value={newComment}
              onValueChange={setNewComment}
              minRows={3}
              isRequired
              isDisabled={submitting}
            />
            <div>
              <label className="text-sm font-medium mb-2 block">
                Attachments (optional)
              </label>
              <input
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

      {/* Comments List */}
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
            <div className="py-12 text-center">
              <p className="text-default-500">No comments yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-b border-divider pb-4 last:border-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        {comment.author_name || 'Anonymous'}
                      </p>
                    </div>
                    <p className="text-default-500 text-xs">
                      {formatDate(comment.created)}
                    </p>
                  </div>
                  <p className="text-default-700 whitespace-pre-wrap">
                    {comment.message || ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export default TicketCommentsTab

