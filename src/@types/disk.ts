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

export interface DiskNamesResponse {
  ok: boolean;
  error: string | null;
  message?: string;
  data?: {
    disk_names?: string[];
  };
  details?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  request_data?: Record<string, unknown>;
}

export interface DiskPartitionStatusResponse {
  ok: boolean;
  error: string | null;
  message?: string;
  data?: {
    disk: string;
    has_partitions: boolean;
  };
  details?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  request_data?: Record<string, unknown>;
}

export interface DiskPartitionCountResponse {
  ok: boolean;
  error: string | null;
  message?: string;
  data?: {
    disk: string;
    partition_count: number;
  };
  details?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  request_data?: Record<string, unknown>;
}

export interface DiskPartitionInfo {
  name: string | null;
  path: string | null;
  size_bytes: number | null;
  wwn: string | null;
  mount_point: string | null;
  filesystem: string | null;
  options: string[] | null;
  dump: number | null;
  fsck: number | null;
}

export interface DiskInventoryItem {
  disk: string;
  model: string | null;
  vendor: string | null;
  state: string | null;
  device_path: string | null;
  physical_block_size: string | number | null;
  logical_block_size: string | number | null;
  scheduler: string | null;
  wwid: string | null;
  total_bytes: number | null;
  temperature_celsius: number | null;
  wwn: string | null;
  uuid: string | null;
  slot_number: string | number | null;
  type: string | null;
  has_partition: boolean | null;
  used_bytes: number | null;
  free_bytes: number | null;
  usage_percent: number | null;
  partitions: DiskPartitionInfo[] | null;
}

export interface DiskInventoryResponse {
  ok: boolean;
  error: string | null;
  message?: string;
  data?: DiskInventoryItem[];
  details?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  request_data?: Record<string, unknown>;
}

export interface DiskDetailResponse {
  ok: boolean;
  error: string | null;
  message?: string;
  data?: DiskInventoryItem | null;
  details?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  request_data?: Record<string, unknown>;
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