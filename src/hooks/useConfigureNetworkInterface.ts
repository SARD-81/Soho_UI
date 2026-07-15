import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type {
  ConfigureInterfacePayload,
  ConfigureNetworkRequestBody,
} from '../@types/network';
import axiosInstance from '../lib/axiosInstance';
import { extractApiErrorMessage } from '../utils/apiError';
import { networkQueryKey } from './useNetwork';

const DEFAULT_MTU = 1500;

const buildRequestBody = (
  payload: ConfigureInterfacePayload
): ConfigureNetworkRequestBody => {
  const mtu = payload.mtu ?? DEFAULT_MTU;

  if (payload.mode === 'dhcp') {
    return {
      mode: 'dhcp',
      mtu,
    };
  }

  const gateway = payload.gateway?.trim() ?? '';
  const dns = (payload.dns ?? [])
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  return {
    mode: 'static',
    ip: payload.ip.trim(),
    netmask: payload.netmask.trim(),
    ...(gateway ? { gateway } : {}),
    ...(dns.length > 0 ? { dns } : {}),
    mtu,
  };
};

const configureNetworkInterfaceRequest = async (
  payload: ConfigureInterfacePayload
) => {
  const encodedInterfaceName = encodeURIComponent(payload.interfaceName);
  const endpoint =
    payload.mode === 'dhcp'
      ? `/api/network/${encodedInterfaceName}/configure/`
      : `/api/system/network/${encodedInterfaceName}/configure/`;

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
