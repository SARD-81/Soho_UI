import { useQueries } from '@tanstack/react-query';
import type { ServiceEntry } from '../@types/service';
import axiosInstance from '../lib/axiosInstance';

interface ServiceStatusResponse {
  data?: {
    status?: {
      enabled?: boolean;
      [key: string]: unknown;
    };
  };
}

const fetchServiceStatus = async (unitName: string) => {
  const encodedName = encodeURIComponent(unitName);
  const { data } = await axiosInstance.get<ServiceStatusResponse>(
    `/api/system/service/${encodedName}/`
  );
  return data;
};

export const useServiceStatuses = (services: ServiceEntry[]) => {
  const queries = useQueries({
    queries: services.map((service) => ({
      queryKey: ['services', 'status', service.unit],
      queryFn: () => fetchServiceStatus(service.unit),
      enabled: Boolean(service.unit),
      refetchInterval: 5000,
    })),
  });

  return new Map(
    services.map((service, index) => [
      service.unit,
      queries[index]?.data?.data?.status?.enabled,
    ])
  );
};
