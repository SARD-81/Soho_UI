export interface ZpoolListResponse {
  data: string[];
}

export type ZpoolCapacityPayload = Record<string, unknown>;

export interface ZpoolCapacityResponse {
  data: ZpoolCapacityPayload;
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
