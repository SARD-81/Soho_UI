export interface VolumeApiResponse {
  data?: Record<string, VolumeRawEntry>;
  [key: string]: unknown;
}

export type VolumeRawEntry = Record<string, unknown>;

export interface VolumeAttribute {
  key: string;
  value: string;
}

export interface VolumeEntry {
  id: string;
  fullName: string;
  poolName: string;
  volumeName: string;
  attributes: VolumeAttribute[];
  attributeMap: Record<string, string>;
  raw: VolumeRawEntry;
}

export interface VolumeGroup {
  poolName: string;
  volumes: VolumeEntry[];
}

export interface VolumeQueryResult {
  volumes: VolumeEntry[];
}
