export type HistoryPoint = {
  time: number;
  upload: number;
  download: number;
};

export type History = Record<string, HistoryPoint[]>;

export type IPv4Info = {
  address: string;
  netmask: string | null;
};

export type NetworkMode = 'static' | 'dhcp';

export type ConfigureNetworkPayload = {
  interfaceName: string;
  mode: NetworkMode;
  ip?: string;
  netmask?: string;
  gateway?: string;
  dns?: string[];
  mtu: number;
};
