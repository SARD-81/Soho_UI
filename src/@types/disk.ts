export interface DiskUsage {
  total: number;
  used: number;
  free: number;
  percent: number;
}

export interface DiskIOStats {
  read_count: number;
  write_count: number;
  read_bytes: number;
  write_bytes: number;
  read_time: number;
  write_time: number;
  read_merged_count: number;
  write_merged_count: number;
  busy_time: number;
}

export interface DiskDevice {
  device: string;
  mountpoint: string;
  fstype: string;
  opts: string;
  usage: DiskUsage;
  io: Partial<DiskIOStats>;
  details: Record<string, unknown>;
}

export interface DiskSummary {
  total_disks: number;
  disk_io_summary: Record<string, Partial<DiskIOStats>>;
}

export interface DiskResponse {
  disks: DiskDevice[];
  summary: DiskSummary;
}

export interface DiskWwnMapResponse {
  data: Record<string, string>;
}

export interface FreeDiskResponse {
  ok: boolean;
  error: string | null;
  data: string[];
  details?: { count: number };
}

export type NormalizedMetrics = Record<keyof DiskIOStats, number>;

export type DiskMetricConfig = {
  key: keyof DiskIOStats;
  label: string;
  getValue: (metrics: NormalizedMetrics) => number;
  format: (value: number) => string;
};

export interface DeviceMetricDatum {
  name: string;
  metrics: NormalizedMetrics;
}