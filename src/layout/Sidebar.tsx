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
    path: '/backup',
    label: 'Backup Status',
    icon: Database,
  },
]

function Sidebar({ collapsed, onToggle }: SidebarProps) {

  return (
    <div
      className={`bg-[#232b33] transition-all duration-300 flex flex-col relative z-20 ${collapsed ? 'w-16' : 'w-64'
        } shadow-2xl space-y-1`}
    >
      <div className="h-16 shrink-0 border-b border-white/5 flex items-center px-4 mb-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
            <span className="text-white font-bold text-xs">VD</span>
          </div>
          {!collapsed && (
            <h2 className="text-xs font-bold text-white/90 truncate tracking-widest uppercase">
              VG DATACENTER
            </h2>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto pt-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <div key={item.path} className="mb-0.5">
              <NavLink
                to={item.path}
                end={item.path === '/tickets' || item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition-all relative group ${isActive
                    ? 'text-white font-medium bg-white/10'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                    )}
                    <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                    {!collapsed && <span className="text-sm tracking-tight">{item.label}</span>}
                  </>
                )}
              </NavLink>

              {!collapsed && item.children && (
                <div className="mt-0.5 space-y-0.5">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon

                    if (child.path.includes(':serverId')) {
                      return null;
                    }

                    return (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        end={child.path === '/tickets'}
                        className={({ isActive }) =>
                          `flex items-center gap-2 pl-10 pr-3 py-1.5 rounded-md text-[13px] transition-all relative group ${isActive
                            ? 'text-white font-medium bg-white/10'
                            : 'text-gray-500 hover:bg-white/5 hover:text-white'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-[3px] h-4 bg-primary/60 rounded-r-full" />
                            )}
                            <ChildIcon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-white'}`} />
                            <span className="tracking-tight">{child.label}</span>
                          </>
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      <div className="p-2 border-t border-white/5 mt-auto">
        <Button
          variant="light"
          onPress={onToggle}
          size="sm"
          className={`w-full flex items-center justify-center min-w-0 text-gray-500 hover:text-white hover:bg-white/5 ${collapsed ? 'px-0' : 'gap-2 px-3'}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : (
            <>
              <ChevronLeft size={16} />
              <span className="text-xs font-medium uppercase tracking-wider">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default Sidebar

