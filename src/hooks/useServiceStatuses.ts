import { useQueries } from '@tanstack/react-query';
import type { ServiceEntry, ServiceFlagValue } from '../@types/service';
import axiosInstance from '../lib/axiosInstance';

interface ServiceStatusResponse {
  enabled?: ServiceFlagValue;
  status?: {
    enabled?: ServiceFlagValue;
    [key: string]: unknown;
  };
  data?: {
    enabled?: ServiceFlagValue;
    status?: {
      enabled?: ServiceFlagValue;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

const fetchServiceStatus = async (unitName: string) => {
  const encodedName = encodeURIComponent(unitName);
  const { data } = await axiosInstance.get<ServiceStatusResponse>(
    `/api/system/service/${encodedName}/`
  );
  return data;
};

const getEnabledState = (
  response: ServiceStatusResponse | undefined
): ServiceFlagValue =>
  response?.data?.status?.enabled ??
  response?.data?.enabled ??
  response?.status?.enabled ??
  response?.enabled;

export const useServiceStatuses = (services: ServiceEntry[]) => {
  const queries = useQueries({
    queries: services.map((service) => ({
      queryKey: ['services', 'status', service.unit],
      queryFn: () => fetchServiceStatus(service.unit),
      enabled: Boolean(service.unit),
      refetchInterval: 5000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
    })),
  });

  return new Map(
    services.map((service, index) => [
      service.unit,
      getEnabledState(queries[index]?.data),
    ])
  );
};
