import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';

interface Bandwidth {
  download: number;
  upload: number;
  unit: string;
}

interface InterfaceAddress {
  address?: string | null;
  family?: string | null;
  [key: string]: unknown;
}

interface NetworkInterface {
  bandwidth: Bandwidth;
  addresses?: InterfaceAddress[] | Record<string, InterfaceAddress | null> | null;
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
