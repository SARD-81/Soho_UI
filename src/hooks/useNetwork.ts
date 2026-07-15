import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';

interface Bandwidth {
  download: number;
  upload: number;
  unit: string;
}

export interface CurrentNetworkSpeed {
  upload: number;
  download: number;
  unit: 'bytes_per_sec';
}

interface NetworkBandwidthSnapshot {
  bandwidth: Bandwidth;
  currentSpeed: CurrentNetworkSpeed;
}

export interface InterfaceAddress {
  address?: string | null;
  netmask?: string | null;
  family?: string | null;
  [key: string]: unknown;
}

export interface InterfaceStatus {
  speed?: number | string | null;
  is_up?: boolean | null;
  [key: string]: unknown;
}

export interface NetworkInterface {
  bandwidth: Bandwidth;
  currentSpeed: CurrentNetworkSpeed;
  addresses?:
    | InterfaceAddress[]
    | Record<string, InterfaceAddress | null>
    | null;
  status?: InterfaceStatus | null;
}

export interface NetworkData {
  interfaces: Record<string, NetworkInterface>;
}

export interface NetworkListResponse {
  ok?: boolean;
  data?: { count?: number; names?: string[] };
  [key: string]: unknown;
}

export interface NetworkDetailsResponse {
  ok?: boolean;
  data?: {
    bandwidth?: {
      upload_bytes?: number;
      download_bytes?: number;
      total_upload_bytes?: number;
      total_download_bytes?: number;
    };
    traffic_summary?: {
      speed?: number | null;
      volume?: { bytes_sent?: number; bytes_recv?: number };
      packets?: Record<string, number>;
    };
    hardware?: {
      name?: string;
      mac_address?: string;
      mtu?: number;
      is_up?: boolean;
      speed_mbps?: number | null;
    };
    general?: {
      mac_address?: string;
      mtu?: number;
      is_up?: boolean;
      ip_addresses?: Array<
        | { ip?: string; netmask?: string | null; broadcast?: string | null }
        | { ipv6?: string; netmask?: string | null }
      >;
    };
  };
  [key: string]: unknown;
}

interface NetworkSpeedResponse {
  ok?: boolean;
  data?: {
    total_upload_bytes?: number | string | null;
    total_download_bytes?: number | string | null;
    current_upload_speed_bytes_per_sec?: number | string | null;
    current_download_speed_bytes_per_sec?: number | string | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export const networkQueryKey = ['network'] as const;

const EMPTY_BANDWIDTH: Bandwidth = {
  upload: 0,
  download: 0,
  unit: 'bytes',
};

const EMPTY_CURRENT_SPEED: CurrentNetworkSpeed = {
  upload: 0,
  download: 0,
  unit: 'bytes_per_sec',
};

const toSafeNumber = (value: unknown) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.max(numericValue, 0) : 0;
};

const mapAddresses = (
  addresses:
    | Array<
        | { ip?: string; netmask?: string | null; broadcast?: string | null }
        | { ipv6?: string; netmask?: string | null }
      >
    | null
    | undefined
): InterfaceAddress[] => {
  if (!addresses || !Array.isArray(addresses)) {
    return [];
  }

  return addresses.flatMap((entry) => {
    if (typeof entry !== 'object' || entry == null) {
      return [];
    }

    const records: InterfaceAddress[] = [];

    if ('ip' in entry && entry.ip) {
      const ipString = String(entry.ip);
      records.push({
        address: ipString,
        netmask: 'netmask' in entry ? entry.netmask ?? null : null,
        family: ipString.includes(':') ? 'IPv6' : 'IPv4',
      });
    }

    if ('ipv6' in entry && entry.ipv6) {
      const ipv6String = String(entry.ipv6);
      records.push({
        address: ipv6String,
        netmask: 'netmask' in entry ? entry.netmask ?? null : null,
        family: 'IPv6',
      });
    }

    return records;
  });
};

const mapInitialBandwidth = (
  payload?: NetworkDetailsResponse['data']
): Bandwidth => {
  const bandwidth = payload?.bandwidth;
  const volume = payload?.traffic_summary?.volume;

  return {
    upload: toSafeNumber(
      bandwidth?.total_upload_bytes ??
        bandwidth?.upload_bytes ??
        volume?.bytes_sent
    ),
    download: toSafeNumber(
      bandwidth?.total_download_bytes ??
        bandwidth?.download_bytes ??
        volume?.bytes_recv
    ),
    unit: 'bytes',
  };
};

const mapBandwidthSnapshot = (
  payload: NetworkSpeedResponse['data'] | undefined
): NetworkBandwidthSnapshot => ({
  bandwidth: {
    upload: toSafeNumber(payload?.total_upload_bytes),
    download: toSafeNumber(payload?.total_download_bytes),
    unit: 'bytes',
  },
  currentSpeed: {
    upload: toSafeNumber(payload?.current_upload_speed_bytes_per_sec),
    download: toSafeNumber(payload?.current_download_speed_bytes_per_sec),
    unit: 'bytes_per_sec',
  },
});

const mapInterface = (
  name: string,
  payload: NetworkDetailsResponse['data']
): [string, NetworkInterface] => {
  const general = payload?.general;
  const hardware = payload?.hardware;

  return [
    name,
    {
      bandwidth: mapInitialBandwidth(payload),
      currentSpeed: EMPTY_CURRENT_SPEED,
      addresses: mapAddresses(general?.ip_addresses),
      status: {
        speed: hardware?.speed_mbps ?? payload?.traffic_summary?.speed ?? null,
        is_up: hardware?.is_up ?? general?.is_up ?? null,
      },
    },
  ];
};

const fetchNetworkInterfaces = async (): Promise<NetworkData> => {
  const { data: listResponse } = await axiosInstance.get<NetworkListResponse>(
    '/api/system/network'
  );

  const names = (listResponse.data?.names ?? []).filter(
    (name): name is string =>
      typeof name === 'string' && name.trim().length > 0
  );

  const interfaces = await Promise.all(
    names.map(async (name) => {
      const { data } = await axiosInstance.get<NetworkDetailsResponse>(
        `/api/system/network/${encodeURIComponent(name)}/`,
        { params: { property: 'all' } }
      );

      return mapInterface(name, data.data ?? {});
    })
  );

  return { interfaces: Object.fromEntries(interfaces) } satisfies NetworkData;
};

const fetchNetworkBandwidthSnapshots = async (
  names: string[]
): Promise<Record<string, NetworkBandwidthSnapshot>> => {
  if (!names.length) {
    return {};
  }

  const interfaces = await Promise.all(
    names.map(async (name) => {
      const { data } = await axiosInstance.get<NetworkSpeedResponse>(
        `/api/system/network/${encodeURIComponent(name)}/bandwidth/`
      );

      return [name, mapBandwidthSnapshot(data.data)] as const;
    })
  );

  return Object.fromEntries(interfaces);
};

export const useNetwork = (enabled = true) => {
  const detailsQuery = useQuery<NetworkData, Error>({
    queryKey: networkQueryKey,
    queryFn: fetchNetworkInterfaces,
    enabled,
  });

  const interfaceNames = Object.keys(detailsQuery.data?.interfaces ?? {});

  const bandwidthSnapshotQuery = useQuery<
    Record<string, NetworkBandwidthSnapshot>,
    Error
  >({
    queryKey: [...networkQueryKey, 'bandwidth-snapshots', interfaceNames],
    queryFn: () => fetchNetworkBandwidthSnapshots(interfaceNames),
    enabled: enabled && interfaceNames.length > 0,
    refetchInterval: 2000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });

  const mergedData = useMemo<NetworkData | undefined>(() => {
    if (!detailsQuery.data) {
      return undefined;
    }

    const interfaces = Object.entries(detailsQuery.data.interfaces).reduce(
      (result, [name, networkInterface]) => {
        const latestSnapshot = bandwidthSnapshotQuery.data?.[name];

        result[name] = latestSnapshot
          ? {
              ...networkInterface,
              bandwidth: latestSnapshot.bandwidth,
              currentSpeed: latestSnapshot.currentSpeed,
            }
          : {
              ...networkInterface,
              bandwidth: networkInterface.bandwidth ?? EMPTY_BANDWIDTH,
              currentSpeed: networkInterface.currentSpeed ?? EMPTY_CURRENT_SPEED,
            };

        return result;
      },
      {} as Record<string, NetworkInterface>
    );

    return { interfaces } satisfies NetworkData;
  }, [bandwidthSnapshotQuery.data, detailsQuery.data]);

  return {
    ...detailsQuery,
    data: mergedData,
    error: detailsQuery.error ?? bandwidthSnapshotQuery.error,
    isFetching: detailsQuery.isFetching || bandwidthSnapshotQuery.isFetching,
    isLoading: detailsQuery.isLoading || bandwidthSnapshotQuery.isLoading,
    refetch: async () => {
      const baseResult = await detailsQuery.refetch();

      if (baseResult.data) {
        await bandwidthSnapshotQuery.refetch();
      }

      return baseResult;
    },
  };
};
