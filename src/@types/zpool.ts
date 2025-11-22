export type ZpoolCapacityPayload = Record<string, unknown>;

export interface ZpoolListResponse {
  data: ZpoolCapacityPayload[];
}

export interface ZpoolCapacityEntry {
  name: string;
  totalBytes: number | null;
  usedBytes: number | null;
  freeBytes: number | null;
  capacityPercent: number | null;
  deduplication?: string | null;
  deduplicationRatio?: number | null;
  fragmentationPercent?: number | null;
  health?: string;
  raw: ZpoolCapacityPayload;
}

export interface ZpoolQueryResult {
  pools: ZpoolCapacityEntry[];
  failedPools: string[];
}

export interface ZpoolDetailEntry {
  [key: string]: unknown;
}

export interface ZpoolDetailResponse {
  data?: ZpoolDetailEntry[];
}

export interface ZpoolDeviceEntry {
  full_path_wwn?: string | null;
  full_disk_wwn?: string | null;
  wwn?: string | null;
  full_path_name?: string | null;
  full_disk_name?: string | null;
  disk_name?: string | null;
  status?: string | null;
  type?: string | null;
}

export interface ZpoolDeviceResponse {
  ok: boolean;
  error: string | null;
  message?: string;
  data?: ZpoolDeviceEntry[];
  details?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  request_data?: Record<string, unknown>;
}
