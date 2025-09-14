import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';

interface Bandwidth {
  download: number;
  upload: number;
}

interface NetworkInterface {
  bandwidth: Bandwidth;
}

export interface NetworkData {
  interfaces: Record<string, NetworkInterface>;
}

const fetchNetwork = async () => {
  const { data } = await axiosInstance.get<NetworkData>('/network');
  return data;
};

export const useNetwork = () => {
  return useQuery<NetworkData, Error>({
    queryKey: ['network'],
    queryFn: fetchNetwork,
    refetchInterval: 1000,
  });
};
