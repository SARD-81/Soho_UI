export type HistoryPoint = {
  time: number;
  upload: number;
  download: number;
  currentUploadSpeed: number;
  currentDownloadSpeed: number;
};

export type History = Record<string, HistoryPoint[]>;

export type IPv4Info = {
  address: string;
  netmask: string | null;
};

export type ConfigureInterfaceMode = 'dhcp' | 'static';

export interface NetworkInterfaceConfiguration {
  configMode: ConfigureInterfaceMode;
  ip: string;
  netmask: string;
  gateways: string[];
  dns: string[];
  mtu: number | null;
}

export type ConfigureInterfacePayload =
  | {
      interfaceName: string;
      mode: 'dhcp';
      mtu?: number;
    }
  | {
      interfaceName: string;
      mode: 'static';
      ip: string;
      netmask: string;
      gateway?: string;
      dns?: string[];
      mtu?: number;
    };

export type ConfigureDhcpNetworkRequestBody = {
  mode: 'dhcp';
  mtu: number;
};

export type ConfigureStaticNetworkRequestBody = {
  mode: 'static';
  ip: string;
  netmask: string;
  gateway?: string;
  dns?: string[];
  mtu: number;
};

export type ConfigureNetworkRequestBody =
  | ConfigureDhcpNetworkRequestBody
  | ConfigureStaticNetworkRequestBody;
