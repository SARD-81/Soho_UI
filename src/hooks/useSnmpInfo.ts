import { useQuery } from '@tanstack/react-query';
import type { SnmpInfoData, SnmpInfoResponse } from '../@types/snmp';
import axiosInstance from '../lib/axiosInstance';

export const snmpInfoQueryKey = ['snmp', 'info'] as const;

const normalizeSnmpInfo = (payload?: SnmpInfoData): SnmpInfoData => {
  if (!payload) {
    return {};
  }

  const allowedIps = Array.isArray(payload.allowed_ips)
    ? payload.allowed_ips.map((ip) => String(ip))
    : [];

  return {
    ...payload,
    community: payload.community ?? '',
    allowed_ips: allowedIps,
    contact: payload.contact ?? '',
    location: payload.location ?? '',
    sys_name: payload.sys_name ?? '',
    enabled: payload.enabled ?? false,
    port: payload.port ?? '',
    bind_ip: payload.bind_ip ?? '',
    version: payload.version ?? '',
  } satisfies SnmpInfoData;
};

const fetchSnmpInfo = async (): Promise<SnmpInfoData> => {
  const { data } = await axiosInstance.get<SnmpInfoResponse>('/api/snmp/info/');

  return normalizeSnmpInfo(data.data);
};

export const useSnmpInfo = () =>
  useQuery<SnmpInfoData, Error>({
    queryKey: snmpInfoQueryKey,
    queryFn: fetchSnmpInfo,
    staleTime: 60_000,
  });

export type UseSnmpInfoReturn = ReturnType<typeof useSnmpInfo>;
