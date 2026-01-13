import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Tooltip,
} from '@heroui/react'
import { Bell, HelpCircle, Settings, LogOut, User } from 'lucide-react'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { useAuth } from '@/features/auth/context/AuthContext'

function Topbar() {
  const { user, logout } = useAuth()

  return (
    <Navbar
      maxWidth="full"
      position="sticky"
      className="border-b border-divider bg-background/60 backdrop-blur-md"
      classNames={{
        wrapper: "px-6",
      }}
    >
      <NavbarBrand>
        {/* Brand can be here if not in sidebar */}
      </NavbarBrand>

      <NavbarContent justify="end" className="gap-4">
        <NavbarItem className="flex gap-2 items-center border-r border-divider pr-4">
          <Tooltip content="Notifications">
            <Button isIconOnly variant="light" size="sm" className="text-default-500">
              <Bell className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Help">
            <Button isIconOnly variant="light" size="sm" className="text-default-500">
              <HelpCircle className="w-4 h-4" />
            </Button>
          </Tooltip>
        </NavbarItem>

        <NavbarItem>
          <ThemeSwitcher />
        </NavbarItem>

        <NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                name={user?.name || 'User'}
                size="sm"
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold text-xs text-default-500">Signed in as</p>
                <p className="font-semibold">{user?.email || user?.username}</p>
              </DropdownItem>
              <DropdownItem key="settings" startContent={<Settings className="w-4 h-4" />}>
                My Settings
              </DropdownItem>
              <DropdownItem key="team_settings" startContent={<User className="w-4 h-4" />}>
                Team Settings
              </DropdownItem>
              <DropdownItem key="logout" color="danger" startContent={<LogOut className="w-4 h-4" />} onPress={() => logout()}>
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  )
}

export default Topbar
