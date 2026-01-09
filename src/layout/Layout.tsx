import { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import AppShell from './AppShell'

interface LayoutProps {
  children?: ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <AppShell>
      {children || <Outlet />}
    </AppShell>
  )
}

export default Layout

