export interface SnmpInfoData {
  community?: string;
  allowed_ips?: string[];
  contact?: string;
  location?: string;
  sys_name?: string;
  enabled?: boolean;
  port?: string;
  bind_ip?: string;
  version?: string;
  [key: string]: unknown;
}

export interface SnmpInfoResponse {
  ok?: boolean;
  message?: string;
  data?: SnmpInfoData;
  [key: string]: unknown;
}

export interface SnmpConfigPayload {
  community: string;
  allowed_ips: string[];
  contact: string;
  location: string;
  sys_name: string;
  port: string;
  bind_ip: string;
  save_to_db: boolean;
}

export interface SnmpConfigResponse {
  ok?: boolean;
  message?: string;
  data?: SnmpInfoData;
  [key: string]: unknown;
}

export interface SnmpTestConnectionPayload {
  community: string;
  host: string;
  port: string;
}

export interface SnmpTestConnectionData {
  connection_success?: boolean | string;
  [key: string]: unknown;
}

export interface SnmpTestConnectionResponse {
  ok?: boolean;
  connection_success?: boolean | string;
  message?: string;
  data?: SnmpTestConnectionData | null;
  [key: string]: unknown;
}
