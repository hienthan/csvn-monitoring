import { useState, useEffect, useRef, useCallback } from 'react'
import { NetdataKpis } from '../netdata.types'
import { fetchAllNetdataMetrics } from '../services/netdataService'

const NORMAL_POLL_INTERVAL = 15000 // 15 seconds
const BACKOFF_POLL_INTERVAL = 60000 // 60 seconds
const FETCH_TIMEOUT = 5000 // 5 seconds

export function useNetdataKpis(serverIp?: string, enabled: boolean = true) {
    const [state, setState] = useState<NetdataKpis>({
        data: null,
        alarms: { critical: 0, warning: 0 },
        status: 'Offline',
        lastUpdated: null,
        isLoading: true,
        isDegraded: false,
        error: null,
        cpu: null,
        load: null,
        ram: null,
        swapUsed: null,
        swapFree: null,
        diskRead: null,
        diskWrite: null,
        netIn: null,
        netOut: null,
    })

    // Using ref for serverIp and enabled to avoid stale closure in timer
    const configRef = useRef({ serverIp, enabled })
    useEffect(() => {
        configRef.current = { serverIp, enabled }
    }, [serverIp, enabled])

    const failCountRef = useRef(0)
    const timerRef = useRef<any>(null)
    const abortControllerRef = useRef<AbortController | null>(null)

    const fetchMetrics = useCallback(async () => {
        const { serverIp: currentIp, enabled: isEnabled } = configRef.current
        if (!currentIp || !isEnabled || document.visibilityState !== 'visible') return

        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

        const timeoutId = setTimeout(() => {
            if (abortControllerRef.current) abortControllerRef.current.abort()
        }, FETCH_TIMEOUT)

        try {
            const { metrics, alarms } = await fetchAllNetdataMetrics(currentIp, abortControllerRef.current.signal)
            clearTimeout(timeoutId)

            failCountRef.current = 0
            const isDegraded = alarms.critical > 0 || alarms.warning > 0

            setState(prev => ({
                ...prev,
                data: metrics,
                alarms,
                status: isDegraded ? 'Degraded' : 'Online',
                lastUpdated: new Date().toLocaleTimeString(),
                isLoading: false,
                isDegraded,
                error: null,
                // Simplified fields
                cpu: metrics.cpu,
                load: metrics.load,
                ram: metrics.ram,
                swapUsed: metrics.swapUsed,
                swapFree: metrics.swapFree,
                diskRead: metrics.ioRead,
                diskWrite: metrics.ioWrite,
                netIn: metrics.netIn,
                netOut: metrics.netOut,
            }))

            scheduleNext(NORMAL_POLL_INTERVAL)
        } catch (err: any) {
            clearTimeout(timeoutId)
            if (err.name === 'AbortError') return

            failCountRef.current++
            const isOffline = failCountRef.current >= 2

            setState(prev => ({
                ...prev,
                status: isOffline ? 'Offline' : prev.status,
                isLoading: false,
                error: err.message || 'Connection failed',
            }))

            scheduleNext(isOffline ? BACKOFF_POLL_INTERVAL : NORMAL_POLL_INTERVAL)
        }
    }, []) // No dependencies, uses configRef

    const scheduleNext = useCallback((interval: number) => {
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(fetchMetrics, interval)
    }, [fetchMetrics])

    useEffect(() => {
        const { serverIp: currentIp, enabled: isEnabled } = configRef.current
        if (!currentIp || !isEnabled) {
            setState(prev => ({ ...prev, isLoading: false }));
            return;
        }

        fetchMetrics()

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchMetrics()
            } else {
                if (timerRef.current) clearTimeout(timerRef.current)
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
            if (abortControllerRef.current) abortControllerRef.current.abort()
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [fetchMetrics, serverIp, enabled])

    return state
}
