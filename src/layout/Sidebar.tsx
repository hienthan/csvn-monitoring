import { NavLink, useLocation } from 'react-router-dom'
import { Button, Chip } from '@heroui/react'
import {
  LayoutDashboard,
  Server,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Plus,
  Package,
  Database
} from 'lucide-react'
import { useSidebarCounts } from '@/lib/hooks/useSidebarCounts'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]
  badge?: number | null
  badgeLabel?: string
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
    badgeLabel: 'Waiting Dev',
  },
  {
    path: '/servers',
    label: 'Infrastructure',
    icon: Server,
    children: [
      {
        path: '/servers',
        label: 'Servers',
        icon: Server,
        badgeLabel: 'Running',
      },
      {
        path: '/apps',
        label: 'Applications',
        icon: Package,
        badgeLabel: 'Running',
      },
      {
        path: '/backup',
        label: 'Backup Status',
        icon: Database,
      },
    ],
  },
  {
    path: '#',
    label: 'Quick Create',
    icon: Plus,
    children: [
      {
        path: '/tickets/new',
        label: 'Create Ticket',
        icon: Ticket,
      },
      {
        path: '/servers/new',
        label: 'Create Server',
        icon: Server,
      },
      {
        path: '/apps/new',
        label: 'Create Application',
        icon: Package,
      },
    ],
  },
]

function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { ticketCount, serverCount, appCount, loading: countsLoading } = useSidebarCounts()
  const location = useLocation()

  // Map counts to nav items
  const navItemsWithCounts = navItems.map((item) => {
    // Add badge to Tickets if it has badgeLabel
    if (item.path === '/tickets' && item.badgeLabel === 'Waiting Dev') {
      return { ...item, badge: ticketCount }
    }
    
    // Add badges to children
    if (item.children) {
      const childrenWithCounts = item.children.map((child) => {
        if (child.path === '/servers' && child.badgeLabel === 'Running') {
          return { ...child, badge: serverCount }
        }
        if (child.path === '/apps' && child.badgeLabel === 'Running') {
          return { ...child, badge: appCount }
        }
        return child
      })
      return { ...item, children: childrenWithCounts }
    }
    return item
  })

  // Check if Infrastructure parent should be active (when any child is active)
  const isInfrastructureActive = location.pathname.startsWith('/servers') || 
                                  location.pathname.startsWith('/apps') || 
                                  location.pathname.startsWith('/backup')

  return (
    <div
      className={`dark:bg-[#0A1426] bg-content1 transition-all duration-300 flex flex-col relative z-20 ${collapsed ? 'w-16' : 'w-64'
        } border-r border-divider`}
    >
      <div className="h-16 shrink-0 border-b border-divider flex items-center px-4 mb-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 border border-divider">
            <span className="text-primary font-bold text-xs">VD</span>
          </div>
          {!collapsed && (
            <h2 className="text-xs font-bold text-foreground truncate tracking-widest uppercase">
              VG DATACENTER
            </h2>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto pt-2 px-2">
        {navItemsWithCounts.map((item) => {
          const Icon = item.icon
          const isParentActive = item.path === '/servers' && isInfrastructureActive
          const isNonClickable = item.path === '#'

          return (
            <div key={item.path} className="mb-1">
              {isNonClickable ? (
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all relative text-default-500`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0 transition-colors text-default-400" />
                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <span className="text-sm tracking-tight truncate">{item.label}</span>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  end={item.path === '/' || item.path === '/tickets'}
                  className={({ isActive }) => {
                    const active = isActive || isParentActive
                    return `flex items-center gap-3 px-3 py-2 rounded-md transition-all relative group ${active
                      ? 'text-primary font-medium'
                      : 'text-default-500 hover:text-foreground hover:bg-default-100'
                    }`
                  }}
                >
                  {({ isActive }) => {
                    const active = isActive || isParentActive
                    return (
                      <>
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                        )}
                        <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${active ? 'text-primary' : 'text-default-400 group-hover:text-foreground'}`} />
                        {!collapsed && (
                          <div className="flex items-center justify-between flex-1 min-w-0">
                            <span className="text-sm tracking-tight truncate">{item.label}</span>
                            {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                              <Chip
                                size="sm"
                                variant="flat"
                                color="primary"
                                className="ml-auto h-5 min-w-5 px-1.5 text-[10px] font-bold"
                              >
                                {item.badge}
                              </Chip>
                            )}
                          </div>
                        )}
                      </>
                    )
                  }}
                </NavLink>
              )}

              {!collapsed && item.children && (
                <div className="mt-0.5 space-y-0.5 ml-3">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon

                    if (child.path.includes(':serverId')) {
                      return null;
                    }

                    return (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        end={child.path === '/tickets' || child.path === '/servers' || child.path === '/apps' || child.path === '/backup'}
                        className={({ isActive }) =>
                          `flex items-center gap-2 pl-7 pr-3 py-1.5 rounded-md text-[13px] transition-all relative group ${isActive
                            ? 'text-primary font-medium dark:bg-[rgba(75,141,255,0.16)] bg-primary/10'
                            : 'text-default-500 dark:hover:bg-[rgba(255,255,255,0.06)] hover:text-foreground hover:bg-default-100'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-primary rounded-r-full" />
                            )}
                            <ChildIcon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-primary' : 'text-default-400 group-hover:text-foreground'}`} />
                            <div className="flex items-center justify-between flex-1 min-w-0">
                              <span className="tracking-tight truncate">{child.label}</span>
                              {child.badge !== undefined && child.badge !== null && child.badge > 0 && (
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color="primary"
                                  className="ml-auto h-5 min-w-5 px-1.5 text-[10px] font-bold"
                                >
                                  {child.badge}
                                </Chip>
                              )}
                            </div>
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
      <div className="p-2 border-t border-divider mt-auto">
        <Button
          variant="light"
          onPress={onToggle}
          size="sm"
          className={`w-full flex items-center justify-center min-w-0 text-default-500 hover:text-foreground hover:bg-default-100 ${collapsed ? 'px-0' : 'gap-2 px-3'}`}
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

