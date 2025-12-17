import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';

interface Bandwidth {
  download: number;
  upload: number;
  unit: string;
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
    bandwidth?: { upload_bytes?: number; download_bytes?: number };
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

export const networkQueryKey = ['network'] as const;

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

type BandwidthPayload = { upload_bytes?: number; download_bytes?: number } | null;

const isBandwidthPayload = (payload: unknown): payload is BandwidthPayload => {
  return (
    payload != null &&
    typeof payload === 'object' &&
    ('upload_bytes' in payload || 'download_bytes' in payload)
  );
};

const mapBandwidth = (
  payload?: NetworkDetailsResponse['data'] | BandwidthPayload
): Bandwidth => {
  const bandwidth: BandwidthPayload =
    payload && typeof payload === 'object' && 'bandwidth' in payload
      ? payload.bandwidth ?? null
      : isBandwidthPayload(payload)
        ? payload
        : null;
  const safeBandwidth = bandwidth ?? { upload_bytes: 0, download_bytes: 0 };

  return {
    download: safeBandwidth.download_bytes ?? 0,
    upload: safeBandwidth.upload_bytes ?? 0,
    unit: 'bytes',
  };
};

const mapInterface = (
  name: string,
  payload: NetworkDetailsResponse['data']
): [string, NetworkInterface] => {
  const bandwidth = mapBandwidth(payload);
  const general = payload?.general;
  const hardware = payload?.hardware;

  return [
    name,
    {
      bandwidth,
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
    '/api/system/network/'
  );

  const names = listResponse.data?.names ?? [];

  const interfaces = await Promise.all(
    names.map(async (name) => {
      const { data } = await axiosInstance.get<NetworkDetailsResponse>(
        `/api/system/network/${name}/`,
        {
          params: { property: 'all' },
        }
      );
      return mapInterface(name, data.data ?? {});
    })
  );

  return { interfaces: Object.fromEntries(interfaces) } satisfies NetworkData;
};

const fetchNetworkBandwidth = async (
  names: string[]
): Promise<Record<string, Bandwidth>> => {
  if (!names.length) {
    return {};
  }

  const interfaces = await Promise.all(
    names.map(async (name) => {
      const { data } = await axiosInstance.get<NetworkDetailsResponse>(
        `/api/system/network/${name}/`,
        {
          params: { property: 'bandwidth' },
        }
      );

      return [name, mapBandwidth(data.data)] as const;
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

  const bandwidthQuery = useQuery<Record<string, Bandwidth>, Error>({
    queryKey: [...networkQueryKey, 'bandwidth', interfaceNames],
    queryFn: () => fetchNetworkBandwidth(interfaceNames),
    enabled: enabled && Boolean(detailsQuery.data),
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
  });

  const mergedData = useMemo<NetworkData | undefined>(() => {
    if (!detailsQuery.data) {
      return undefined;
    }

    const interfaces = Object.entries(detailsQuery.data.interfaces).reduce(
      (result, [name, networkInterface]) => {
        const latestBandwidth = bandwidthQuery.data?.[name];

        result[name] = latestBandwidth
          ? { ...networkInterface, bandwidth: latestBandwidth }
          : networkInterface;

        return result;
      },
      {} as Record<string, NetworkInterface>
    );

    return { interfaces } satisfies NetworkData;
  }, [detailsQuery.data, bandwidthQuery.data]);

  return {
    ...detailsQuery,
    data: mergedData,
    error: detailsQuery.error ?? bandwidthQuery.error,
    isFetching: detailsQuery.isFetching || bandwidthQuery.isFetching,
    isLoading: detailsQuery.isLoading || bandwidthQuery.isLoading,
    refetch: async () => {
      const baseResult = await detailsQuery.refetch();

      if (baseResult.data) {
        await bandwidthQuery.refetch();
      }

      return baseResult;
    },
  };
};
