import { useState, useEffect } from 'react'
import pb from '@/lib/pb'

export function useSidebarCounts() {
  const [ticketCount, setTicketCount] = useState<number>(0)
  const [serverCount, setServerCount] = useState<number>(0)
  const [appCount, setAppCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true)
        
        // Fetch tickets with status "waiting_dev"
        const ticketsResult = await pb.collection('ma_tickets').getList(1, 1, {
          filter: 'status = "waiting_dev"',
        })
        setTicketCount(ticketsResult.totalItems)

        // Fetch servers with is_active = true
        const serversResult = await pb.collection('ma_servers').getList(1, 1, {
          filter: 'is_active = true',
        })
        setServerCount(serversResult.totalItems)

        // Fetch apps with status = "running"
        const appsResult = await pb.collection('ma_apps').getList(1, 1, {
          filter: 'status = "running"',
        })
        setAppCount(appsResult.totalItems)
      } catch (error) {
        console.error('Error fetching sidebar counts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()
    // Refresh every 5 minutes (300 seconds) since counts change infrequently
    const interval = setInterval(fetchCounts, 300000)
    return () => clearInterval(interval)
  }, [])

  return {
    ticketCount,
    serverCount,
    appCount,
    loading,
  }
}

