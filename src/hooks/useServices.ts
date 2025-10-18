import { useQuery } from '@tanstack/react-query';
import type { ServicesResponse } from '../@types/service';
import axiosInstance from '../lib/axiosInstance';
import { createVisibilityAwareInterval } from '../utils/refetchInterval';

export const servicesQueryKey = ['services'] as const;

const fetchServices = async () => {
  const { data } = await axiosInstance.get<ServicesResponse>('/api/service/');
  return data;
};

export const useServices = () =>
  useQuery<ServicesResponse, Error>({
    queryKey: servicesQueryKey,
    queryFn: fetchServices,
    refetchInterval: createVisibilityAwareInterval(10000),
  });

export type UseServicesReturn = ReturnType<typeof useServices>;
