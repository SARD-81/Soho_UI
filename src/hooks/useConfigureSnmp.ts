import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SnmpConfigPayload, SnmpConfigResponse } from '../@types/snmp';
import axiosInstance from '../lib/axiosInstance';
import { snmpInfoQueryKey } from './useSnmpInfo';

const configureSnmp = async (payload: SnmpConfigPayload) => {
  const { data } = await axiosInstance.post<SnmpConfigResponse>(
    '/api/snmp/config/',
    payload
  );
  return data;
};

export const useConfigureSnmp = () => {
  const queryClient = useQueryClient();

  return useMutation<SnmpConfigResponse, Error, SnmpConfigPayload>({
    mutationFn: configureSnmp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: snmpInfoQueryKey });
    },
  });
};

export type UseConfigureSnmpReturn = ReturnType<typeof useConfigureSnmp>;
