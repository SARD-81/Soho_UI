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

export type ConfigureInterfaceMode = 'dhcp' | 'static';

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
      gateway: string;
      dns: string[];
    };

export type ConfigureNetworkRequestBody =
  | {
      mode: 'dhcp';
      mtu: 1400;
      save_to_db: false;
    }
  | {
      mode: 'static';
      ip: string;
      netmask: string;
      gateway: string;
      dns: string[];
      mtu: 1500;
      save_to_db: false;
    };
