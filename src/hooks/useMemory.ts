import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';

export interface MemoryBlock {
  range: string;
  size_bytes: number;
  state: string;
  removable: boolean;
  device: string | null;
}

export interface MemoryData {
  memory_blocks?: MemoryBlock[];
  total_online_memory_bytes?: number;
  total_offline_memory_bytes?: number;
  total_bytes?: number;
  available_bytes?: number;
  used_bytes?: number;
  free_bytes?: number;
  usage_percent?: number;
  psutil_usage_percent?: number;
  [key: string]: unknown;
}

export interface MemoryApiResponse {
  ok?: boolean;
  error?: string | null;
  message?: string | null;
  data?: MemoryData;
  [key: string]: unknown;
}

const fetchMemory = async () => {
  const { data } = await axiosInstance.get<MemoryApiResponse>(
    '/api/system/memory/',
    {
      params: { property: 'all' },
    }
  );
  return data;
};

export const useMemory = () => {
  return useQuery<MemoryApiResponse, Error>({
    queryKey: ['memory'],
    queryFn: fetchMemory,
    refetchInterval: 2000,
  });
};
