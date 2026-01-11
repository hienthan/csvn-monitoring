import { Button } from '@heroui/react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: LucideIcon
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
}: EmptyStateProps) {
  return (
    <div className="py-16 px-4 text-center space-y-4">
      {Icon && (
        <Icon 
          size={48} 
          className="mx-auto text-default-400 dark:text-default-500 stroke-[1.5]" 
        />
      )}
      <div className="space-y-2">
        <p className="text-base font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-default-500 max-w-md mx-auto">
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button
          color="primary"
          variant="solid"
          onPress={onAction}
          className="font-medium"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

