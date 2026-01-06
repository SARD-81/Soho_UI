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
}

export interface SnmpConfigResponse {
  ok?: boolean;
  message?: string;
  data?: SnmpInfoData;
  [key: string]: unknown;
}
