import { NavLink, useLocation } from 'react-router-dom'
import { Button } from '@heroui/react'
import { 
  LayoutDashboard, 
  Server, 
  Ticket, 
  Database,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Network,
  List,
  Plus
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    path: '/servers',
    label: 'Servers',
    icon: Server,
    children: [
      {
        path: '/servers/:serverId/apps',
        label: 'Apps',
        icon: FolderOpen,
      },
      {
        path: '/servers/:serverId/ports',
        label: 'Ports',
        icon: Network,
      },
    ],
  },
  {
    path: '/tickets',
    label: 'Tickets',
    icon: Ticket,
    children: [
      {
        path: '/tickets',
        label: 'Tickets (list)',
        icon: List,
      },
      {
        path: '/tickets/new',
        label: 'New Ticket',
        icon: Plus,
      },
    ],
  },
  {
    path: '/backup',
    label: 'Backup Status',
    icon: Database,
  },
]

function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const hasActiveChild = (item: NavItem) => {
    if (!item.children) return false
    const pathParts = location.pathname.split('/')
    return item.children.some(child => {
      if (child.path.includes(':serverId')) {
        // Check if current path matches pattern /servers/:serverId/apps or /servers/:serverId/ports
        return pathParts.length >= 4 && 
               pathParts[1] === 'servers' && 
               (pathParts[3] === 'apps' || pathParts[3] === 'ports')
      }
      return location.pathname.startsWith(child.path)
    })
  }

  return (
    <div
      className={`bg-default-50 border-r border-divider transition-all duration-300 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-4 border-b border-divider flex items-center justify-between">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-foreground">CSVN Monitoring</h2>
        )}
        <Button
          isIconOnly
          variant="light"
          size="sm"
          onPress={onToggle}
          className="min-w-0"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          const hasChildActive = hasActiveChild(item)

          return (
            <div key={item.path} className="mb-1">
              <NavLink
                to={item.path}
                className={({ isActive: isNavActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1 ${
                    isNavActive || active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-default-600 hover:bg-default-100'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </NavLink>

              {!collapsed && item.children && (active || hasChildActive) && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon
                    const pathParts = location.pathname.split('/')
                    
                    // Handle dynamic serverId replacement
                    let childPath = child.path
                    if (child.path.includes(':serverId')) {
                      const serverId = pathParts[2] || '1'
                      childPath = child.path.replace(':serverId', serverId)
                    }
                    
                    // Check if current route matches this child
                    const childActive = child.path.includes(':serverId')
                      ? pathParts.length >= 4 && 
                        pathParts[1] === 'servers' && 
                        pathParts[3] === child.path.split('/')[3]
                      : location.pathname === child.path || 
                        (child.path !== '/tickets' && location.pathname.startsWith(child.path))

                    return (
                      <NavLink
                        key={child.path}
                        to={childPath}
                        className={({ isActive: isNavActive }) =>
                          `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                            isNavActive || childActive
                              ? 'bg-primary/20 text-primary'
                              : 'text-default-500 hover:bg-default-100'
                          }`
                        }
                      >
                        <ChildIcon className="w-4 h-4" />
                        <span>{child.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}

export default Sidebar

