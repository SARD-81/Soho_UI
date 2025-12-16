import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type {
  ConfigureInterfacePayload,
  ConfigureNetworkRequestBody,
} from '../@types/network';
import axiosInstance from '../lib/axiosInstance';
import { extractApiErrorMessage } from '../utils/apiError';
import { networkQueryKey } from './useNetwork';

const buildRequestBody = (
  payload: ConfigureInterfacePayload
): ConfigureNetworkRequestBody => {
  if (payload.mode === 'dhcp') {
    return {
      mode: 'dhcp',
      mtu: 1400,
      save_to_db: false,
    };
  }

  return {
    mode: 'static',
    ip: payload.ip.trim(),
    netmask: payload.netmask.trim(),
    gateway: payload.gateway.trim(),
    dns: payload.dns.map((entry) => entry.trim()),
    mtu: 1500,
    save_to_db: false,
  };
};

const configureNetworkInterfaceRequest = async (
  payload: ConfigureInterfacePayload
) => {
  const endpoint = `/api/system/network/${encodeURIComponent(
    payload.interfaceName
  )}/configure/`;

  const body = buildRequestBody(payload);

  await axiosInstance.post(endpoint, body);
};

interface UseConfigureNetworkInterfaceOptions {
  onSuccess?: (interfaceName: string) => void;
  onError?: (message: string) => void;
}

export const useConfigureNetworkInterface = ({
  onSuccess,
  onError,
}: UseConfigureNetworkInterfaceOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError, ConfigureInterfacePayload>({
    mutationFn: configureNetworkInterfaceRequest,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: networkQueryKey });
      onSuccess?.(variables.interfaceName);
    },
    onError: (error) => {
      const message = extractApiErrorMessage(
        error,
        'به‌روزرسانی پیکربندی شبکه با خطا مواجه شد.'
      );
      onError?.(message);
    },
  });
};

export type UseConfigureNetworkInterfaceReturn = ReturnType<
  typeof useConfigureNetworkInterface
>;
