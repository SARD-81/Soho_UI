import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { UpdateInterfaceIpPayload } from '../@types/network';
import axiosInstance from '../lib/axiosInstance';
import type { ApiErrorResponse } from '../utils/apiError';
import { extractApiErrorMessage } from '../utils/apiError';
import { networkQueryKey } from './useNetwork';

const updateInterfaceIpRequest = async ({
  interfaceName,
  ip,
  netmask,
}: UpdateInterfaceIpPayload) => {
  const endpoint = `/api/net/nicfile/${encodeURIComponent(
    interfaceName
  )}/ip/edit/`;

  await axiosInstance.post(endpoint, { ip, netmask });
};

interface UseUpdateInterfaceIpOptions {
  onSuccess?: (interfaceName: string) => void;
  onError?: (message: string) => void;
}

export const useUpdateInterfaceIp = ({
  onSuccess,
  onError,
}: UseUpdateInterfaceIpOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    UpdateInterfaceIpPayload
  >({
    mutationFn: updateInterfaceIpRequest,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: networkQueryKey });
      onSuccess?.(variables.interfaceName);
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error);
      onError?.(message);
    },
  });
};

export type UseUpdateInterfaceIpReturn = ReturnType<
  typeof useUpdateInterfaceIp
>;
