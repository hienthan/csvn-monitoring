import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  path: string
  startContent?: React.ReactNode
  endContent?: React.ReactNode
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-sm text-default-400 font-medium">
      {items.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && <span className="mx-1 text-default-300">/</span>}
          <div className="flex items-center gap-1.5 px-1.5 py-1 rounded-md transition-colors hover:bg-default-100 group">
            {item.startContent}
            {index === items.length - 1 ? (
              <span className="text-foreground font-bold">{item.label}</span>
            ) : (
              <Link
                to={item.path}
                className="text-default-500 group-hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            )}
            {item.endContent}
          </div>
        </React.Fragment>
      ))}
    </nav>
  )
}

export default Breadcrumb

