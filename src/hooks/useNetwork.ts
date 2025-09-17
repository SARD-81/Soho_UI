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

const fetchNetwork = async () => {
  const { data } = await axiosInstance.get<NetworkData>('/network');
  return data;
};

export const useNetwork = (enabled = true) => {
  return useQuery<NetworkData, Error>({
    queryKey: ['network'],
    queryFn: fetchNetwork,
    refetchInterval: enabled ? 1000 : false,
    enabled,
  });
};
