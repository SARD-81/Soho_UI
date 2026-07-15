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

interface NetworkSpeedResponse {
  ok?: boolean;
  data?: unknown;
  [key: string]: unknown;
}

export const networkQueryKey = ['network'] as const;

const EMPTY_CURRENT_SPEED: CurrentNetworkSpeed = {
  upload: 0,
  download: 0,
  unit: 'bytes_per_sec',
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

type BandwidthPayload = { upload_bytes?: number; download_bytes?: number } | null;

const isBandwidthPayload = (payload: unknown): payload is BandwidthPayload =>
  payload != null &&
  typeof payload === 'object' &&
  ('upload_bytes' in payload || 'download_bytes' in payload);

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

const findNumericValueByKey = (value: unknown, targetKey: string): number | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (targetKey in record) {
    const numericValue = Number(record[targetKey]);
    return Number.isFinite(numericValue) ? Math.max(numericValue, 0) : null;
  }

  for (const nestedValue of Object.values(record)) {
    const result = findNumericValueByKey(nestedValue, targetKey);
    if (result !== null) {
      return result;
    }
  }

  return null;
};

const mapCurrentNetworkSpeed = (payload: unknown): CurrentNetworkSpeed => ({
  upload:
    findNumericValueByKey(payload, 'current_upload_speed_bytes_per_sec') ?? 0,
  download:
    findNumericValueByKey(payload, 'current_download_speed_bytes_per_sec') ?? 0,
  unit: 'bytes_per_sec',
});

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
    (name): name is string => typeof name === 'string' && name.trim().length > 0
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

const fetchNetworkBandwidth = async (
  names: string[]
): Promise<Record<string, Bandwidth>> => {
  if (!names.length) {
    return {};
  }

  const interfaces = await Promise.all(
    names.map(async (name) => {
      const { data } = await axiosInstance.get<NetworkDetailsResponse>(
        `/api/system/network/${encodeURIComponent(name)}/`,
        { params: { property: 'bandwidth' } }
      );

      return [name, mapBandwidth(data.data)] as const;
    })
  );

  return Object.fromEntries(interfaces);
};

const fetchCurrentNetworkSpeeds = async (
  names: string[]
): Promise<Record<string, CurrentNetworkSpeed>> => {
  if (!names.length) {
    return {};
  }

  const interfaces = await Promise.all(
    names.map(async (name) => {
      const { data } = await axiosInstance.get<NetworkSpeedResponse>(
        `/api/system/network/${encodeURIComponent(name)}/bandwidth/`
      );

      return [name, mapCurrentNetworkSpeed(data.data ?? data)] as const;
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
    queryKey: [...networkQueryKey, 'bandwidth-total', interfaceNames],
    queryFn: () => fetchNetworkBandwidth(interfaceNames),
    enabled: enabled && interfaceNames.length > 0,
    refetchInterval: 2000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });

  const currentSpeedQuery = useQuery<Record<string, CurrentNetworkSpeed>, Error>({
    queryKey: [...networkQueryKey, 'bandwidth-current-speed', interfaceNames],
    queryFn: () => fetchCurrentNetworkSpeeds(interfaceNames),
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
        result[name] = {
          ...networkInterface,
          bandwidth: bandwidthQuery.data?.[name] ?? networkInterface.bandwidth,
          currentSpeed:
            currentSpeedQuery.data?.[name] ?? networkInterface.currentSpeed,
        };
        return result;
      },
      {} as Record<string, NetworkInterface>
    );

    return { interfaces } satisfies NetworkData;
  }, [bandwidthQuery.data, currentSpeedQuery.data, detailsQuery.data]);

  return {
    ...detailsQuery,
    data: mergedData,
    error:
      detailsQuery.error ?? bandwidthQuery.error ?? currentSpeedQuery.error,
    isFetching:
      detailsQuery.isFetching ||
      bandwidthQuery.isFetching ||
      currentSpeedQuery.isFetching,
    isLoading:
      detailsQuery.isLoading ||
      bandwidthQuery.isLoading ||
      currentSpeedQuery.isLoading,
    refetch: async () => {
      const baseResult = await detailsQuery.refetch();

      if (baseResult.data) {
        await Promise.all([
          bandwidthQuery.refetch(),
          currentSpeedQuery.refetch(),
        ]);
      }

      return baseResult;
    },
  };
};
