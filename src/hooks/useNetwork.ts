import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';
import { createVisibilityAwareInterval } from '../utils/refetchInterval';

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

export const networkQueryKey = ['network'] as const;

const fetchNetwork = async () => {
  const { data } = await axiosInstance.get<NetworkData>('/api/net');
  return data;
};

export const useNetwork = (enabled = true) => {
  return useQuery<NetworkData, Error>({
    queryKey: networkQueryKey,
    queryFn: fetchNetwork,
    refetchInterval: enabled ? createVisibilityAwareInterval(5000) : false,
    enabled,
  });
};
