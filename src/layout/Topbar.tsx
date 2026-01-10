import { ThemeSwitcher } from '@/components/ThemeSwitcher'

function Topbar() {
  return (
    <div className="h-16 border-b border-divider bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {/* Breadcrumb or dynamic title could go here if needed in future */}
      </div>
      <div className="flex items-center gap-3">
        <ThemeSwitcher />
      </div>
    </div>
  )
}

export default Topbar
