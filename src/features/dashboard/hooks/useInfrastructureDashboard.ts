import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useServers } from '@/features/servers/hooks/useServers'
import { fetchNetdataHistory, fetchAllNetdataMetrics, calculateCpuUsage, calculateRamUsagePercent } from '@/features/servers/services/netdataService'
import type { Server } from '@/features/servers/types'

export interface AggregatedChartData {
  time: number
  value: number
  secondaryValue?: number
}

export interface ServerNetdataState {
  serverId: string
  name: string
  ip: string
  metrics: any
  alarms: any
  history: Record<string, any[]>
  lastUpdated: number
  isReachable: boolean
}

const HISTORY_POINTS = 60 
const REFRESH_INTERVAL = 15000 // 15s

export function useInfrastructureDashboard() {
  const { servers: allServers, loading: serversLoading } = useServers()
  const [serverStates, setServerStates] = useState<Record<string, ServerNetdataState>>({})
  const [loading, setLoading] = useState(true)
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null)
  
  const cache = useRef<Record<string, { data: any, timestamp: number }>>({})

  // Filter servers with netdata
  const netdataServers = useMemo(() => 
    allServers.filter(s => (s as any).is_netdata_enabled && s.ip),
    [allServers]
  )

  const fetchServerData = useCallback(async (server: Server) => {
    try {
      const ip = server.ip || ''
      const { metrics, alarms } = await fetchAllNetdataMetrics(ip)
      
      const charts = ['system.cpu', 'system.ram', 'system.net', 'system.io', 'mem.swap']
      const history: Record<string, any[]> = {}
      
      await Promise.all(charts.map(async chart => {
          const cacheKey = `${server.id}_${chart}`
          const cached = cache.current[cacheKey]
          
          // Reuse cache if less than 15s old
          if (cached && Date.now() - cached.timestamp < REFRESH_INTERVAL) {
            history[chart] = cached.data
            return
          }

          const data = await fetchNetdataHistory(ip, chart, HISTORY_POINTS)
          history[chart] = data
          cache.current[cacheKey] = { data, timestamp: Date.now() }
      }))

      return {
        serverId: server.id,
        name: server.name,
        ip: server.ip,
        metrics,
        alarms,
        history,
        lastUpdated: Date.now(),
        isReachable: true
      }
    } catch (err) {
      return {
        serverId: server.id,
        name: server.name,
        ip: server.ip,
        metrics: null,
        alarms: { critical: 0, warning: 0 },
        history: {},
        lastUpdated: Date.now(),
        isReachable: false
      }
    }
  }, [])

  const refreshAll = useCallback(async () => {
    if (netdataServers.length === 0) {
      if (!serversLoading) setLoading(false)
      return
    }

    const results = await Promise.all(netdataServers.map(s => fetchServerData(s)))
    const newState: Record<string, ServerNetdataState> = {}
    results.forEach(res => {
      newState[res.serverId] = res as ServerNetdataState
    })
    
    setServerStates(newState)
    setLoading(false)

    // Set default selected server if not set
    if (!selectedServerId && results.length > 0) {
      const mainServer = results.find(r => r.name.toLowerCase().includes('main')) || results[0]
      setSelectedServerId(mainServer?.serverId || null)
    }
  }, [netdataServers, fetchServerData, selectedServerId, serversLoading])

  useEffect(() => {
    if (!serversLoading) {
      refreshAll()
      const interval = setInterval(refreshAll, REFRESH_INTERVAL)
      return () => clearInterval(interval)
    }
  }, [serversLoading, refreshAll])

  // Aggregation Logic
  const globalOverview = useMemo(() => {
    const states = Object.values(serverStates).filter(s => s.isReachable)
    if (states.length === 0) return null

    // Helper to align timestamps
    const baselineHistory = states[0].history['system.cpu'] || []
    if (baselineHistory.length === 0) return null

    const aggregate = (chart: string, type: 'avg' | 'total', processor: (p: any) => number | {v1: number, v2: number}) => {
      return baselineHistory.map((_, idx) => {
        let sum = 0
        let sum2 = 0
        let count = 0
        
        states.forEach(s => {
          const point = s.history[chart]?.[idx]
          if (point) {
            const val = processor(point)
            if (typeof val === 'number') {
              sum += val
            } else {
              sum += val.v1
              sum2 += val.v2
            }
            count++
          }
        })

        const time = baselineHistory[idx].time
        if (type === 'avg') {
           return { time, value: count > 0 ? sum / count : 0 }
        } else {
           return { time, value: sum, secondaryValue: sum2 }
        }
      })
    }

    return {
      cpu: aggregate('system.cpu', 'avg', p => calculateCpuUsage(p)),
      ram: aggregate('system.ram', 'avg', p => calculateRamUsagePercent(p)),
      net: aggregate('system.net', 'total', p => ({ v1: p.received || 0, v2: p.sent || 0 })),
      io: aggregate('system.io', 'total', p => ({ v1: p.reads || 0, v2: p.writes || 0 }))
    }
  }, [serverStates])

  const topProblematic = useMemo(() => {
    const states = Object.values(serverStates).filter(s => s.isReachable && s.metrics)
    
    const topCpu = [...states]
      .sort((a, b) => (b.metrics.cpu || 0) - (a.metrics.cpu || 0))
      .slice(0, 5)
      .map(s => ({ name: s.name, value: s.metrics.cpu }))

    const topRam = [...states]
      .sort((a, b) => (b.metrics.ram || 0) - (a.metrics.ram || 0))
      .slice(0, 5)
      .map(s => ({ name: s.name, value: s.metrics.ram }))

    return { cpu: topCpu, ram: topRam }
  }, [serverStates])

  const focusServer = selectedServerId ? serverStates[selectedServerId] : null

  return {
    globalOverview,
    topProblematic,
    focusServer,
    allNetdataServers: netdataServers,
    selectedServerId,
    setSelectedServerId,
    loading: loading || serversLoading,
    serverStates
  }
}
