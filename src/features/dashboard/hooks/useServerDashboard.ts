import { useMemo } from 'react'
import { useServers } from '@/features/servers/hooks/useServers'

export function useServerDashboard() {
  const { servers, loading, error } = useServers()

  const metrics = useMemo(() => {
    if (!servers.length) return null

    const total = servers.length
    const online = servers.filter(s => (s as any).is_active).length
    const offline = total - online
    
    // Status distribution
    const statusData = [
      { name: 'Online', value: online, color: '#17c964' },
      { name: 'Offline', value: offline, color: '#f31260' },
    ].filter(d => d.value > 0)

    // Environment distribution
    const envMap: Record<string, number> = {}
    servers.forEach(s => {
      const env = s.environment || (s as any).env || 'Production'
      envMap[env] = (envMap[env] || 0) + 1
    })
    
    const envColors: Record<string, string> = {
      'Production': '#f31260',
      'Staging': '#f5a623',
      'Development': '#17c964',
      'Testing': '#006fee',
      'PRD': '#f31260',
      'DEV': '#17c964',
      'STG': '#f5a623'
    }

    const envData = Object.entries(envMap).map(([name, value]) => ({
      name,
      value,
      color: envColors[name] || '#71717a'
    }))

    // OS distribution
    const osMap: Record<string, number> = {}
    servers.forEach(s => {
      const os = s.os || 'Linux'
      osMap[os] = (osMap[os] || 0) + 1
    })
    const osData = Object.entries(osMap).map(([name, value]) => ({ name, value }))

    return {
      total,
      online,
      offline,
      statusData,
      envData,
      osData
    }
  }, [servers])

  return { metrics, loading, error }
}
