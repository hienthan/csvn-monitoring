import { ReactNode } from 'react'

interface PageContainerProps {
    children: ReactNode
    className?: string
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
    return (
        <div className={`w-full max-w-full 2xl:max-w-[1720px] mx-auto px-6 lg:px-8 min-w-0 ${className}`}>
            {children}
        </div>
    )
}
