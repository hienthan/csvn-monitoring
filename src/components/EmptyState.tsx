import { Button } from '@heroui/react'
import { FileX, RefreshCw } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export function EmptyState({
  title = 'No items found',
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="py-16 text-center space-y-4">
      {icon || <FileX size={48} className="mx-auto text-default-300" />}
      <div>
        <p className="text-lg font-medium text-default-700">{title}</p>
        {description && (
          <p className="text-sm text-default-500 mt-2">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button
          color="primary"
          startContent={<RefreshCw size={16} />}
          onPress={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

