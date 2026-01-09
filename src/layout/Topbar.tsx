import { Input } from '@heroui/react'
import { Search } from 'lucide-react'
import { useSearch } from '@/lib/contexts/SearchContext'
import { useLocation } from 'react-router-dom'

function Topbar() {
  const { searchQuery, setSearchQuery } = useSearch()
  const location = useLocation()

  // Only show search on servers page
  const showSearch = location.pathname === '/servers'

  return (
    <div className="h-16 border-b border-divider bg-background flex items-center justify-between px-6">
      <div className="flex-1 max-w-md">
        <Input
          type="search"
          placeholder={showSearch ? "Search servers..." : "Search..."}
          value={showSearch ? searchQuery : ''}
          onValueChange={showSearch ? setSearchQuery : undefined}
          isDisabled={!showSearch}
          startContent={<Search className="w-4 h-4 text-default-400" />}
          classNames={{
            base: 'w-full',
            input: 'text-sm',
            inputWrapper: 'bg-default-100',
          }}
        />
      </div>
      <div className="flex items-center gap-2">
        {/* Action area placeholder */}
        <div className="w-8 h-8 rounded-full bg-default-200"></div>
      </div>
    </div>
  )
}

export default Topbar

