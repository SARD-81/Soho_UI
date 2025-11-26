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
  save_to_db: boolean;
}

export type VdevType = 'disk' | 'mirror' | 'raidz' | '';

const validatePoolName = (trimmedName: string): string | null => {
  if (!trimmedName) {
    return 'لطفاً نام فضای یکپارچه را وارد کنید.';
  }

  if (!/^[A-Za-z0-9]+$/.test(trimmedName)) {
    return 'نام فضای یکپارچه باید فقط شامل حروف انگلیسی و اعداد باشد.';
  }

  if (/^[0-9]/.test(trimmedName)) {
    return 'نام فضای یکپارچه نمی‌تواند با عدد شروع شود.';
  }

  return null;
};

const vdevSpecificDeviceRules: Record<Exclude<VdevType, ''>, (count: number) => string | null> = {
  disk: () => null,
  mirror: (count) => {
    if (count < 2 || count % 2 !== 0) {
      return 'برای MIRROR تعداد دیسک‌ها باید عددی زوج و حداقل ۲ باشد.';
    }

    return null;
  },
  raidz: (count) => {
    if (count < 3) {
      return 'برای RAID5 حداقل سه دیسک انتخاب کنید.';
    }

    return null;
  },
};

const resolveDevicesError = (deviceCount: number, vdevType: VdevType) => {
  if (deviceCount === 0) {
    return 'حداقل یک دیسک را انتخاب کنید.';
  }

  const rule = vdevType ? vdevSpecificDeviceRules[vdevType] : null;

  if (!rule) {
    return null;
  }

  return rule(deviceCount);
};

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
  const [vdevType, setVdevType] = useState<VdevType>('');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [poolNameError, setPoolNameError] = useState<string | null>(null);
  const [vdevTypeError, setVdevTypeError] = useState<string | null>(null);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setPoolName('');
    setVdevType('');
    setSelectedDevices([]);
    setPoolNameError(null);
    setVdevTypeError(null);
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
      await axiosInstance.post('/api/zpool/create/', payload);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['zpool'] });
      queryClient.invalidateQueries({ queryKey: ['disk', 'free'] });
      handleClose();
      onSuccess?.(variables.pool_name);
    },
    onError: (error) => {
      const apiMessage = extractApiMessage(error);
      setApiError(apiMessage);
      onError?.(apiMessage);
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
      setVdevTypeError(null);
      setDevicesError(null);
      setApiError(null);

      const trimmedName = poolName.trim();
      let hasError = false;

      const resolvedPoolNameError = validatePoolName(trimmedName);
      if (resolvedPoolNameError) {
        setPoolNameError(resolvedPoolNameError);
        hasError = true;
      }

      if (!vdevType) {
        setVdevTypeError('لطفاً نوع آرایه را انتخاب کنید.');
        hasError = true;
      }

      const deviceCount = selectedDevices.length;
      const resolvedDevicesError = resolveDevicesError(deviceCount, vdevType);

      if (resolvedDevicesError) {
        setDevicesError(resolvedDevicesError);
        hasError = true;
      }

      if (hasError) {
        return;
      }

      createPoolMutation.mutate({
        pool_name: trimmedName,
        devices: selectedDevices,
        vdev_type: vdevType,
        save_to_db: true,
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
    vdevTypeError,
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
    setVdevTypeError,
    toggleDevice: handleDeviceToggle,
    handleSubmit,
    setPoolNameError,
  };
};

export type UseCreatePoolReturn = ReturnType<typeof useCreatePool>;