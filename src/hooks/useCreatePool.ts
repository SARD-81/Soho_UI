import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  existingPoolNames?: string[];
}

type PoolNameStatus = 'idle' | 'available' | 'duplicate' | 'invalid';

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
  existingPoolNames = [],
}: UseCreatePoolOptions = {}) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [poolName, setPoolNameState] = useState('');
  const [vdevType, setVdevType] = useState('disk');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [poolNameError, setPoolNameError] = useState<string | null>(null);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [poolNameStatus, setPoolNameStatus] = useState<PoolNameStatus>('idle');

  const existingPoolNamesRef = useRef<string[]>(existingPoolNames);

  useEffect(() => {
    existingPoolNamesRef.current = existingPoolNames;
  }, [existingPoolNames]);


  const resetForm = useCallback(() => {
    setPoolNameState('');
    setVdevType('disk');
    setSelectedDevices([]);
    setPoolNameError(null);
    setDevicesError(null);
    setApiError(null);
    setPoolNameStatus('idle');
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

  const handlePoolNameInput = useCallback(
    (value: string) => {
      setApiError(null);

      const noWhitespace = value.replace(/\s+/g, '');
      const englishOnlyValue = noWhitespace.replace(/[^A-Za-z0-9]/g, '');
      const hadInvalidCharacters = englishOnlyValue !== noWhitespace;

      setPoolNameState(englishOnlyValue);

      if (englishOnlyValue.length === 0) {
        setPoolNameStatus(hadInvalidCharacters ? 'invalid' : 'idle');
        setPoolNameError(
          hadInvalidCharacters
            ? 'نام فضای یکپارچه باید فقط شامل حروف انگلیسی و اعداد باشد.'
            : null
        );
        return;
      }

      if (hadInvalidCharacters) {
        setPoolNameStatus('invalid');
        setPoolNameError(
          'نام فضای یکپارچه باید فقط شامل حروف انگلیسی و اعداد باشد.'
        );
        return;
      }

      const normalizedValue = englishOnlyValue.toLowerCase();
      const isDuplicate = existingPoolNamesRef.current.some(
        (name) => name.toLowerCase() === normalizedValue
      );

      if (isDuplicate) {
        setPoolNameStatus('duplicate');
        setPoolNameError(
          'نام فضای یکپارچه تکراری است. لطفاً نام دیگری انتخاب کنید.'
        );
        return;
      }

      setPoolNameStatus('available');
      setPoolNameError(null);
    },
    []
  );

  useEffect(() => {
    if (!isOpen || poolName.length === 0) {
      return;
    }

    handlePoolNameInput(poolName);
    // We intentionally ignore exhaustive-deps here because handlePoolNameInput
    // already captures the latest dependencies we care about.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingPoolNames, isOpen, poolName]);

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
        setPoolNameStatus('idle');
        hasError = true;
      }

      if (!hasError && !/^[A-Za-z0-9]+$/.test(trimmedName)) {
        setPoolNameError(
          'نام فضای یکپارچه باید فقط شامل حروف انگلیسی و اعداد باشد.'
        );
        setPoolNameStatus('invalid');
        hasError = true;
      }

      if (!hasError) {
        const normalizedValue = trimmedName.toLowerCase();
        const isDuplicate = existingPoolNamesRef.current.some(
          (name) => name.toLowerCase() === normalizedValue
        );

        if (isDuplicate) {
          setPoolNameError(
            'نام فضای یکپارچه تکراری است. لطفاً نام دیگری انتخاب کنید.'
          );
          setPoolNameStatus('duplicate');
          hasError = true;
        }
      }

      const deviceCount = selectedDevices.length;

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
    setPoolName: handlePoolNameInput,
    setVdevType,
    toggleDevice: handleDeviceToggle,
    handleSubmit,
    poolNameStatus,
  };
};

export type UseCreatePoolReturn = ReturnType<typeof useCreatePool>;
