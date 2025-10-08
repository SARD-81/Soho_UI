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

export const useCreatePool = ({
  onSuccess,
  onError,
}: UseCreatePoolOptions = {}) => {
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
      const message = extractApiMessage(error);
      setApiError(message);
      onError?.(message);
    },
  });

  const handleDeviceToggle = useCallback((device: string) => {
    setDevicesError(null);
    setApiError(null);

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
        setPoolNameError('لطفاً نام فضای یکپارچه را وارد کنید.');
        hasError = true;
      } else if (!/^[A-Za-z0-9]+$/.test(trimmedName)) {
        setPoolNameError(
          'نام فضای یکپارچه باید فقط شامل حروف انگلیسی و اعداد باشد.'
        );
        hasError = true;
      }

      const sanitizedDevices = Array.from(
        new Set(
          selectedDevices
            .map((device) => device.trim())
            .filter((device) => device.length > 0)
        )
      );

      const deviceCount = sanitizedDevices.length;

      if (deviceCount === 0) {
        setDevicesError('حداقل یک دیسک را انتخاب کنید.');
        hasError = true;
      } else if (vdevType === 'mirror') {
        if (deviceCount < 2 || deviceCount % 2 !== 0) {
          setDevicesError(
            'برای MIRROR تعداد دیسک‌ها باید عددی زوج و حداقل ۲ باشد.'
          );
          hasError = true;
        }
      } else if (vdevType === 'raidz') {
        if (deviceCount < 3) {
          setDevicesError('برای RAID5 حداقل سه دیسک انتخاب کنید.');
          hasError = true;
        }
      }

      if (hasError) {
        return;
      }

      createPoolMutation.mutate({
        pool_name: trimmedName,
        devices: sanitizedDevices,
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
