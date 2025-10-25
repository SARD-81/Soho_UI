export interface SystemUptimeInfo {
  humanReadable?: string | null;
  asOf?: string | null;
}

export interface SystemUpdateInfo {
  available: boolean;
  message?: string | null;
}

export interface SystemInfoResponse {
  productName?: string | null;
  productLine?: string | null;
  platform?: string | null;
  version?: string | null;
  hostname?: string | null;
  uptime?: SystemUptimeInfo | null;
  updates?: SystemUpdateInfo | null;
}
