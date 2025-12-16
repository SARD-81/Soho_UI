import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ConfigureNetworkPayload } from '../@types/network';
import axiosInstance from '../lib/axiosInstance';
import { extractApiErrorMessage } from '../utils/apiError';
import { networkQueryKey } from './useNetwork';

const configureNetworkRequest = async ({ interfaceName, ...payload }: ConfigureNetworkPayload) => {
  const endpoint = `/api/system/network/${encodeURIComponent(interfaceName)}/configure/`;

  const requestBody =
    payload.mode === 'static'
      ? {
          mode: payload.mode,
          ip: payload.ip,
          netmask: payload.netmask,
          gateway: payload.gateway,
          dns: payload.dns,
          mtu: payload.mtu,
        }
      : { mode: payload.mode, mtu: payload.mtu };

  await axiosInstance.post(endpoint, requestBody);
};

interface UseConfigureNetworkOptions {
  onSuccess?: (interfaceName: string) => void;
  onError?: (message: string) => void;
}

export const useConfigureNetwork = ({
  onSuccess,
  onError,
}: UseConfigureNetworkOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError, ConfigureNetworkPayload>({
    mutationFn: configureNetworkRequest,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: networkQueryKey });
      onSuccess?.(variables.interfaceName);
    },
    onError: (error) => {
      const message = extractApiErrorMessage(
        error,
        'به‌روزرسانی تنظیمات شبکه با خطا مواجه شد.'
      );
      onError?.(message);
    },
  });
};

export type UseConfigureNetworkReturn = ReturnType<typeof useConfigureNetwork>;