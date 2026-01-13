export interface NetdataMetrics {
    cpu: number;
    load: number;
    ram: number;
    swapUsed: number;
    swapFree: number;
    netIn: number;
    netOut: number;
    ioRead: number;
    ioWrite: number;
}

export interface NetdataAlarms {
    critical: number;
    warning: number;
}

export type NetdataStatus = 'Online' | 'Degraded' | 'Offline';

export interface NetdataKpis {
    data: NetdataMetrics | null;
    alarms: NetdataAlarms;
    status: NetdataStatus;
    lastUpdated: string | null;
    isLoading: boolean;
    isDegraded: boolean;
    error: string | null;
    // Simplified fields for easy binding as requested in point 6
    cpu: number | null;
    load: number | null;
    ram: number | null;
    swapUsed: number | null;
    swapFree: number | null;
    diskRead: number | null;
    diskWrite: number | null;
    netIn: number | null;
    netOut: number | null;
}
