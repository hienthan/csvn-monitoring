import { ReactNode } from 'react'

interface PageContainerProps {
    children: ReactNode
    className?: string
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
    return (
        <div className={`w-full max-w-6xl mx-auto px-6 lg:px-8 min-w-0 ${className}`}>
            {children}
        </div>
    )
}
