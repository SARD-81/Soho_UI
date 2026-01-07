export interface NfsShareClientEntry {
  client: string;
  options: Record<string, unknown>;
}

export interface NfsShareEntry {
  path: string;
  clients: NfsShareClientEntry[];
}

export interface NfsSharesResponse {
  ok: boolean;
  error: string | null;
  message: string;
  data: NfsShareEntry[];
  details?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  request_data?: Record<string, unknown>;
}

export type NfsShareOptionKey =
  | 'read_write'
  | 'sync'
  | 'root_squash'
  | 'all_squash'
  | 'insecure'
  | 'no_subtree_check';

export type NfsShareOptionValues = Record<NfsShareOptionKey, boolean>;

export interface NfsSharePayload extends NfsShareOptionValues {
  save_to_db: boolean;
  path: string;
  clients: string;
}
