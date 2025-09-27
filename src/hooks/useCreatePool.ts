import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';
import axiosInstance from '../lib/axiosInstance';

interface ApiErrorResponse {
  detail?: string;
  message?: string;
  errors?: string | string[];
  [key: string]: unknown;
}

interface CreatePoolPayload {
  pool_name: string;
  devices: string[];
  vdev_type: string;
}

interface UseCreatePoolOptions {
  onSuccess?: (poolName: string) => void;
  onError?: (errorMessage: string) => void;
}

const extractApiMessage = (error: AxiosError<ApiErrorResponse>) => {
  const payload = error.response?.data;

  if (!payload) {
    return error.message;
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (payload.detail && typeof payload.detail === 'string') {
    return payload.detail;
  }

  if (payload.message && typeof payload.message === 'string') {
    return payload.message;
  }

  if (payload.errors) {
    if (Array.isArray(payload.errors)) {
      return payload.errors.join('، ');
    }

    if (typeof payload.errors === 'string') {
      return payload.errors;
    }
  }

  return error.message;
};

export const useCreatePool = ({ onSuccess, onError }: UseCreatePoolOptions = {}) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [poolName, setPoolName] = useState('');
  const [vdevType, setVdevType] = useState('disk');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [poolNameError, setPoolNameError] = useState<string | null>(null);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setPoolName('');
    setVdevType('disk');
    setSelectedDevices([]);
    setPoolNameError(null);
    setDevicesError(null);
    setApiError(null);
  }, []);

  const handleOpen = useCallback(() => {
    resetForm();
    setIsOpen(true);
  }, [resetForm]);

  const handleClose = useCallback(() => {
    resetForm();
    setIsOpen(false);
  }, [resetForm]);

  const createPoolMutation = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    CreatePoolPayload
  >({
    mutationFn: async (payload) => {
      await axiosInstance.post('/api/zpool/create', payload);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['zpool'] });
      handleClose();
      onSuccess?.(variables.pool_name);
    },
    onError: (error) => {
      const errorMessage = extractApiMessage(error);

      setApiError(errorMessage);
      onError?.(errorMessage);
    },
  });

  const handleDeviceToggle = useCallback((device: string) => {
    setSelectedDevices((prev) => {
      if (prev.includes(device)) {
        return prev.filter((item) => item !== device);
      }

      return [...prev, device];
    });
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setPoolNameError(null);
      setDevicesError(null);
      setApiError(null);

      const trimmedName = poolName.trim();
      let hasError = false;

      if (!trimmedName) {
        setPoolNameError('لطفاً نام Pool را وارد کنید.');
        hasError = true;
      }

      if (selectedDevices.length === 0) {
        setDevicesError('حداقل یک دیسک را انتخاب کنید.');
        hasError = true;
      }

      if (hasError) {
        return;
      }

      createPoolMutation.mutate({
        pool_name: trimmedName,
        devices: selectedDevices,
        vdev_type: vdevType,
      });
    },
    [createPoolMutation, poolName, selectedDevices, vdevType]
  );

  return {
    isOpen,
    poolName,
    vdevType,
    selectedDevices,
    poolNameError,
    devicesError,
    apiError,
    isCreating: createPoolMutation.isPending,
    openCreateModal: handleOpen,
    closeCreateModal: () => {
      createPoolMutation.reset();
      handleClose();
    },
    setPoolName,
    setVdevType,
    toggleDevice: handleDeviceToggle,
    handleSubmit,
  };
};

export type UseCreatePoolReturn = ReturnType<typeof useCreatePool>;
