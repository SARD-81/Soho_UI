import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';

export type CpuProperty =
  | 'usage_percent_total'
  | 'cpu_count_logical'
  | 'cpu_count_physical'
  | 'model_name';

export interface CpuApiResponse {
  ok?: boolean;
  error?: string | null;
  message?: string | null;
  data?: Partial<Record<CpuProperty, number | string | null>>;
  [key: string]: unknown;
}

const CPU_PROPERTIES: CpuProperty[] = [
  'usage_percent_total',
  'cpu_count_logical',
  'cpu_count_physical',
  'model_name',
];

const fetchCpu = async () => {
  const { data } = await axiosInstance.get<CpuApiResponse>(
    '/api/system/cpu/',
    {
      params: { property: CPU_PROPERTIES },
    }
  );
  return data;
};

export const useCpu = () => {
  return useQuery<CpuApiResponse, Error>({
    queryKey: ['cpu'],
    queryFn: fetchCpu,
    refetchInterval: 2000,
  });
};