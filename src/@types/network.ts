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
    }
  | {
      interfaceName: string;
      mode: 'static';
      ip: string;
      netmask: string;
      gateway?: string;
      dns?: string[];
    };

export type ConfigureDhcpNetworkRequestBody = {
  mode: 'dhcp';
  mtu: 1500;
};

export type ConfigureStaticNetworkRequestBody = {
  mode: 'static';
  ip: string;
  netmask: string;
  gateway?: string;
  dns?: string[];
  mtu: 1500;
};

export type ConfigureNetworkRequestBody =
  | ConfigureDhcpNetworkRequestBody
  | ConfigureStaticNetworkRequestBody;
