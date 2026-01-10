import { NavLink } from 'react-router-dom'
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

  return (
    <div
      className={`bg-default-50 border-r border-divider transition-all duration-300 flex flex-col ${collapsed ? 'w-16' : 'w-64'
        }`}
    >
      <div className="h-16 shrink-0 border-b border-divider flex items-center px-6">
        {!collapsed && (
          <h2 className="text-lg font-bold text-foreground truncate tracking-tight">CSVN Monitoring</h2>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <div key={item.path} className="mb-1">
              <NavLink
                to={item.path}
                end={item.path === '/tickets' || item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1 ${isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-default-600 hover:bg-default-100'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </NavLink>

              {!collapsed && item.children && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon

                    // Note: In a real app with many servers, we might need a context for currentServerId.
                    // For now, we follow the requirement to keep sidebar active only on current paths.
                    let childPath = child.path
                    if (child.path.includes(':serverId')) {
                      // We don't have serverId context here easily without a hook, 
                      // but the requirement is to use NavLink properly.
                      // If it's the ServerApps or ServerPorts, it won't be active unless matched.
                      return null; // Skip dynamic server items in main nav if they don't have context
                    }

                    return (
                      <NavLink
                        key={child.path}
                        to={childPath}
                        end={child.path === '/tickets'}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${isActive
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
      <div className="p-2 border-t border-divider mt-auto">
        <Button
          variant="light"
          onPress={onToggle}
          className={`w-full flex items-center justify-center min-w-0 ${collapsed ? 'px-0' : 'gap-2 px-3'}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={20} /> : (
            <>
              <ChevronLeft size={18} />
              <span className="text-sm font-medium">Collapse Sidebar</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default Sidebar

