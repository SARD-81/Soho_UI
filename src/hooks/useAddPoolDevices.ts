import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { normalizeVdevType, validateVdevDeviceSelection } from '../constants/vdev';
import axiosInstance from '../lib/axiosInstance';
import { fetchPoolVdevType } from '../lib/poolDevices';

interface ApiErrorResponse {
  detail?: string;
  message?: string;
  errors?: string | string[];
  [key: string]: unknown;
}

interface AddPoolDevicesPayload {
  pool_name: string;
  devices: string[];
  vdev_type: string;
  save_to_db: boolean;
}

interface UseAddPoolDevicesOptions {
  onSuccess?: (poolName: string) => void;
  onError?: (message: string, poolName: string) => void;
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

export const useAddPoolDevices = (options: UseAddPoolDevicesOptions = {}) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [poolName, setPoolName] = useState<string | null>(null);
  const [vdevType, setVdevType] = useState('');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [vdevError, setVdevError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setSelectedDevices([]);
    setDevicesError(null);
    setApiError(null);
    setVdevError(null);
  }, []);

  const closeModal = useCallback(() => {
    resetForm();
    setPoolName(null);
    setVdevType('');
    setIsOpen(false);
  }, [resetForm]);

  const openModal = useCallback(
    (name: string) => {
      resetForm();
      setPoolName(name);
      setIsOpen(true);
    },
    [resetForm]
  );

  const { isFetching: isVdevLoading } = useQuery<string, Error>({
    queryKey: ['zpool', 'vdev-type', poolName],
    queryFn: async () => {
      if (!poolName) {
        throw new Error('نام فضای یکپارچه مشخص نیست.');
      }

      return fetchPoolVdevType(poolName);
    },
    enabled: isOpen && Boolean(poolName),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    onSuccess: (type) => {
      const normalized = normalizeVdevType(type);

      setVdevType(type);
      setVdevError(
        normalized ? null : 'نوع آرایه این فضا قابل شناسایی نیست.'
      );
    },
    onError: (error) => {
      setVdevError(error.message);
      setVdevType('');
    },
  });

  const addDevicesMutation = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    AddPoolDevicesPayload
  >({
    mutationFn: async (payload) => {
      await axiosInstance.post(
        `/api/zpool/${encodeURIComponent(payload.pool_name)}/add/`,
        payload
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['zpool'] });
      queryClient.invalidateQueries({ queryKey: ['zpool', 'devices'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['zpool', 'devices', 'slots'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['disk', 'partitioned'] });
      closeModal();
      options.onSuccess?.(variables.pool_name);
    },
    onError: (error, variables) => {
      const apiMessage = extractApiMessage(error);
      setApiError(apiMessage);
      if (variables.pool_name) {
        options.onError?.(apiMessage, variables.pool_name);
      }
    },
  });

  useEffect(() => {
    if (!isOpen) {
      addDevicesMutation.reset();
    }
  }, [addDevicesMutation, isOpen]);

  const isSubmitting = useMemo(
    () => addDevicesMutation.isPending,
    [addDevicesMutation.isPending]
  );

  const toggleDevice = useCallback((device: string) => {
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
      setDevicesError(null);
      setApiError(null);

      if (!poolName) {
        setApiError('نام فضای یکپارچه نامشخص است.');
        return;
      }

      const normalizedVdevType = normalizeVdevType(vdevType);

      if (!normalizedVdevType) {
        setVdevError('نوع آرایه شناسایی نشده است.');
        return;
      }

      const validationMessage = validateVdevDeviceSelection(
        normalizedVdevType,
        selectedDevices.length
      );

      if (validationMessage) {
        setDevicesError(validationMessage);
        return;
      }

      addDevicesMutation.mutate({
        pool_name: poolName,
        devices: selectedDevices,
        vdev_type: normalizedVdevType,
        save_to_db: true,
      });
    },
    [addDevicesMutation, poolName, selectedDevices, vdevType]
  );

  return {
    isOpen,
    poolName,
    vdevType,
    selectedDevices,
    devicesError,
    apiError,
    vdevError,
    isSubmitting,
    isVdevLoading,
    openModal,
    closeModal,
    toggleDevice,
    handleSubmit,
  };
};

export type UseAddPoolDevicesReturn = ReturnType<typeof useAddPoolDevices>;
