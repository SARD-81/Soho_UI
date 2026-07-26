export interface SystemTimeInfo {
  localTime: string | null;
  utcTime: string | null;
  hardwareLocalTime: string | null;
  hardwareUtcTime: string | null;
  rtcTime: string | null;
  timezone: string | null;
  ntpEnabled: boolean | null;
  ntpSynchronized: boolean | null;
  rtcInLocalTimezone: boolean | null;
  ntpServers: string[];
  raw: unknown;
}

export interface HostnameInfo {
  currentHostname: string | null;
  staticHostname: string | null;
  raw: unknown;
}

export interface SystemVersionInfo {
  lines: string[];
  text: string;
  filePath: string | null;
  backendError: string | null;
  raw: unknown;
}

export type HwclockAction = 'show' | 'hctosys' | 'systohc';

export interface HwclockRequest {
  action: HwclockAction;
  localtime?: boolean;
}

export interface HwclockResult {
  message: string;
  displayValue: string | null;
  raw: unknown;
}

export interface ManageNtpPayload {
  enabled: boolean;
  servers: string[];
}

export interface SetManualTimePayload {
  time: string;
}

export interface SetTimezonePayload {
  timezone: string;
}

export interface SetHostnamePayload {
  hostname: string;
}
