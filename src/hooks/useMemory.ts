import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';

export type MemoryResponse = {
  total?: number | null;
  available?: number | null;
  percent?: number | null;
  used?: number | null;
  free?: number | null;
  buffers?: number | null;
  cached?: number | null;
  [key: string]: number | null | undefined;
};

const fetchMemory = async () => {
  const { data } = await axiosInstance.get<MemoryResponse>('/memory');
  return data;
};

export const useMemory = () => {
  return useQuery<MemoryResponse, Error>({
    queryKey: ['memory'],
    queryFn: fetchMemory,
    refetchInterval: 1000,
  });
};
