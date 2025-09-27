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

interface CreateVolumePayload {
  volume_name: string;
  volsize: string;
}

interface UseCreateVolumeOptions {
  onSuccess?: (volumeName: string) => void;
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

export const useCreateVolume = ({
  onSuccess,
  onError,
}: UseCreateVolumeOptions = {}) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState('');
  const [volumeName, setVolumeName] = useState('');
  const [sizeValue, setSizeValue] = useState('');
  const [sizeUnit, setSizeUnit] = useState<'GB' | 'TB'>('GB');
  const [poolError, setPoolError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setSelectedPool('');
    setVolumeName('');
    setSizeValue('');
    setSizeUnit('GB');
    setPoolError(null);
    setNameError(null);
    setSizeError(null);
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

  const createVolumeMutation = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    CreateVolumePayload
  >({
    mutationFn: async (payload) => {
      await axiosInstance.post('/api/volume/create', payload);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['volumes'] });
      handleClose();
      onSuccess?.(variables.volume_name);
    },
    onError: (error) => {
      const message = extractApiMessage(error);
      setApiError(message);
      onError?.(message);
    },
  });

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setPoolError(null);
      setNameError(null);
      setSizeError(null);
      setApiError(null);

      const trimmedPool = selectedPool.trim();
      const trimmedName = volumeName.trim();
      const trimmedSize = sizeValue.trim();

      let hasError = false;

      if (!trimmedPool) {
        setPoolError('لطفاً Pool مقصد را انتخاب کنید.');
        hasError = true;
      }

      if (!trimmedName) {
        setNameError('نام Volume را وارد کنید.');
        hasError = true;
      }

      if (!trimmedSize) {
        setSizeError('حجم Volume را مشخص کنید.');
        hasError = true;
      } else {
        const numericSize = Number(trimmedSize);
        if (!Number.isFinite(numericSize) || numericSize <= 0) {
          setSizeError('مقدار حجم باید عددی بزرگ‌تر از صفر باشد.');
          hasError = true;
        }
      }

      if (hasError) {
        return;
      }

      const sizeSuffix = sizeUnit === 'GB' ? 'G' : 'T';
      const payload: CreateVolumePayload = {
        volume_name: `${trimmedPool}/${trimmedName}`.replace(/\s+/g, ''),
        volsize: `${trimmedSize}${sizeSuffix}`.replace(/\s+/g, ''),
      };

      createVolumeMutation.mutate(payload);
    },
    [createVolumeMutation, selectedPool, sizeUnit, sizeValue, volumeName]
  );

  return {
    isOpen,
    selectedPool,
    setSelectedPool,
    volumeName,
    setVolumeName,
    sizeValue,
    setSizeValue,
    sizeUnit,
    setSizeUnit,
    poolError,
    nameError,
    sizeError,
    apiError,
    isCreating: createVolumeMutation.isPending,
    openCreateModal: handleOpen,
    closeCreateModal: () => {
      createVolumeMutation.reset();
      handleClose();
    },
    handleSubmit,
  };
};

export type UseCreateVolumeReturn = ReturnType<typeof useCreateVolume>;
