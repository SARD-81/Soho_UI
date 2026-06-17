export interface WebShareApiResponse {
  data?: unknown;
  detail?: string;
  error?: string;
  message?: string;
  ok?: boolean;
  [key: string]: unknown;
}

export interface WebShareRawRecord {
  [key: string]: unknown;
}

export interface WebShareAttributeEntry {
  key: string;
  value: string;
}

export interface WebShareEntry {
  id: string;
  targetName: string;
  poolName: string;
  fsName: string;
  path: string;
  permission: string | null;
  alias: string | null;
  root: string | null;
  attributes: WebShareAttributeEntry[];
  raw: WebShareRawRecord;
}

export interface WebShareCreatePayload {
  pool_name: string;
  fs_name: string;
  save_to_db?: false;
}

export interface WebShareDeleteParams {
  pool_name: string;
  fs_name: string;
  save_to_db?: false;
}

export interface WebSharePermissionPayload {
  pool_name: string;
  fs_name: string;
  permission: string;
}
