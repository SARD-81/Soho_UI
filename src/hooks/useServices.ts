import { useQuery } from '@tanstack/react-query';
import type { ServicesResponse } from '../@types/service';
import axiosInstance from '../lib/axiosInstance';

export const servicesQueryKey = ['services'] as const;

const fetchServices = async () => {
  const { data } = await axiosInstance.get<ServicesResponse>(
    '/api/system/service/'
  );
  return data;
};

export const useServices = () =>
  useQuery<ServicesResponse, Error>({
    queryKey: servicesQueryKey,
    queryFn: fetchServices,
    refetchInterval: 5000,
  });

export type UseServicesReturn = ReturnType<typeof useServices>;