import { NetdataMetrics, NetdataAlarms } from '../netdata.types';

export interface NetdataDataResponse {
    labels: string[];
    data: number[][];
}

const parseDimensions = (resp: NetdataDataResponse, chartName: string) => {
    if (!resp || !resp.data || resp.data.length === 0) return {};
    const labels = resp.labels || [];
    const latestData = resp.data[0];

    if (latestData.some(v => v !== 0 && typeof v === 'number')) {
        // Debug DEV-only
        if (import.meta.env.DEV) {
            console.debug(`[Netdata] ${chartName} labels:`, labels);
            console.debug(`[Netdata] ${chartName} values:`, latestData);
        }
    }

    const result: Record<string, number> = {};
    labels.forEach((label, index) => {
        if (index === 0) return; // skip time
        result[label] = Math.abs(latestData[index]);
    });
    return result;
};

export const fetchNetdataChart = async (serverIp: string, chart: string, signal?: AbortSignal): Promise<Record<string, number>> => {
    const timestamp = Date.now();
    const url = `http://${serverIp}:19999/api/v1/data?chart=${chart}&format=json&after=-30&points=1&_=${timestamp}`;
    try {
        const response = await fetch(url, {
            signal,
            cache: 'no-store'
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const json = await response.json();
        return parseDimensions(json, chart);
    } catch (error) {
        if ((error as Error).name === 'AbortError') throw error;
        console.error(`Failed to fetch netdata chart ${chart} from ${serverIp}:`, error);
        throw error;
    }
};

export const fetchNetdataAlarms = async (serverIp: string, signal?: AbortSignal): Promise<NetdataAlarms> => {
    const timestamp = Date.now();
    const url = `http://${serverIp}:19999/api/v1/alarms?format=json&_=${timestamp}`;
    try {
        const response = await fetch(url, {
            signal,
            cache: 'no-store'
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const json = await response.json();

        let critical = 0;
        let warning = 0;

        if (json.alarms) {
            Object.values(json.alarms).forEach((alarm: any) => {
                // Only count active/raised alarms as per requirement
                if (alarm.status === 'CRITICAL') critical++;
                else if (alarm.status === 'WARNING') warning++;
            });
        }

        return { critical, warning };
    } catch (error) {
        if ((error as Error).name === 'AbortError') throw error;
        console.error(`Failed to fetch netdata alarms from ${serverIp}:`, error);
        throw error;
    }
};

export const fetchAllNetdataMetrics = async (
    serverIp: string,
    signal?: AbortSignal
): Promise<{ metrics: NetdataMetrics, alarms: NetdataAlarms }> => {
    const [cpu, load, ram, swap, net, io, alarms] = await Promise.all([
        fetchNetdataChart(serverIp, 'system.cpu', signal).catch(() => ({} as Record<string, number>)),
        fetchNetdataChart(serverIp, 'system.load', signal).catch(() => ({} as Record<string, number>)),
        fetchNetdataChart(serverIp, 'system.ram', signal).catch(() => ({} as Record<string, number>)),
        fetchNetdataChart(serverIp, 'mem.swap', signal).catch(() => ({} as Record<string, number>)), // Use mem.swap
        fetchNetdataChart(serverIp, 'system.net', signal).catch(() => ({} as Record<string, number>)),
        fetchNetdataChart(serverIp, 'system.io', signal).catch(() => ({} as Record<string, number>)),
        fetchNetdataAlarms(serverIp, signal).catch(() => ({ critical: 0, warning: 0 }))
    ]);

    const cpuUsage = Object.entries(cpu).reduce((acc, [label, val]) => label !== 'idle' ? acc + val : acc, 0);

    const metrics: NetdataMetrics = {
        cpu: Math.round(cpuUsage),
        load: load['load1'] || 0,
        ram: 0,
        swapUsed: swap['used'] || 0,
        swapFree: swap['free'] || 0,
        netIn: net['received'] || 0,
        netOut: net['sent'] || 0,
        ioRead: io['reads'] || 0, // Fix label: reads (plural)
        ioWrite: io['writes'] || 0 // Fix label: writes (plural)
    };

    // RAM percentage calc
    if (ram['used'] !== undefined) {
        const total = (ram['used'] || 0) + (ram['free'] || 0) + (ram['cached'] || 0) + (ram['buffers'] || 0);
        if (total > 0) {
            metrics.ram = Math.round((ram['used'] / total) * 100);
        }
    }

    return { metrics, alarms };
};
