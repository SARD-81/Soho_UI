import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';

export interface CpuFrequency {
  current?: number | null;
  min?: number | null;
  max?: number | null;
}

export interface CpuCores {
  physical?: number | null;
  logical?: number | null;
}

export interface CpuResponse {
  cpu_percent?: number | null;
  cpu_frequency?: CpuFrequency;
  cpu_cores?: CpuCores;
}

const fetchCpu = async () => {
  const { data } = await axiosInstance.get<CpuResponse>('/cpu');
  return data;
};

export const useCpu = () => {
  return useQuery<CpuResponse, Error>({
    queryKey: ['cpu'],
    queryFn: fetchCpu,
    refetchInterval: 3000,
  });
};
