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

interface CreateFileSystemPayload {
  filesystem_name: string;
  quota: string;
  reservation: string;
}

interface UseCreateFileSystemOptions {
  onSuccess?: (filesystemName: string) => void;
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

export const useCreateFileSystem = ({
  onSuccess,
  onError,
}: UseCreateFileSystemOptions = {}) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState('');
  const [filesystemName, setFileSystemName] = useState('');
  const [quotaAmount, setQuotaAmount] = useState('');
  const [poolError, setPoolError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setSelectedPool('');
    setFileSystemName('');
    setQuotaAmount('');
    setPoolError(null);
    setNameError(null);
    setQuotaError(null);
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

  const createFileSystemMutation = useMutation<
    unknown,
    AxiosError<ApiErrorResponse>,
    CreateFileSystemPayload
  >({
    mutationFn: async (payload) => {
      await axiosInstance.post('/api/filesystem/create/', payload);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['filesystems'] });
      handleClose();
      onSuccess?.(variables.filesystem_name);
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
      setQuotaError(null);
      setApiError(null);

      const trimmedPool = selectedPool.trim();
      const trimmedName = filesystemName.trim();
      const trimmedQuota = quotaAmount.trim();

      let hasError = false;

      if (!trimmedPool) {
        setPoolError('لطفاً فضای یکپارچه مقصد را انتخاب کنید.');
        hasError = true;
      }

      if (!trimmedName) {
        setNameError('نام فضای فایلی را وارد کنید.');
        hasError = true;
      } else if (!/^[A-Za-z0-9]+$/.test(trimmedName)) {
        setNameError(
          'نام فضای فایلی باید فقط شامل حروف انگلیسی و اعداد باشد.'
        );
        hasError = true;
      }

      if (!trimmedQuota) {
        setQuotaError('حجم فضای فایلی را به گیگابایت وارد کنید.');
        hasError = true;
      } else {
        const quotaValue = Number(trimmedQuota);

        if (!Number.isFinite(quotaValue) || quotaValue <= 0) {
          setQuotaError('حجم واردشده باید یک عدد معتبر بزرگ‌تر از صفر باشد.');
          hasError = true;
        }
      }

      if (hasError) {
        return;
      }

      const payload: CreateFileSystemPayload = {
        filesystem_name: `${trimmedPool}/${trimmedName}`.replace(/\s+/g, ''),
        quota: `${trimmedQuota}G`,
        reservation: `${trimmedQuota}G`,
      };

      createFileSystemMutation.mutate(payload);
    },
    [createFileSystemMutation, filesystemName, quotaAmount, selectedPool]
  );

  return {
    isOpen,
    selectedPool,
    setSelectedPool,
    filesystemName,
    setFileSystemName,
    quotaAmount,
    setQuotaAmount,
    poolError,
    nameError,
    quotaError,
    apiError,
    isCreating: createFileSystemMutation.isPending,
    openCreateModal: handleOpen,
    closeCreateModal: () => {
      createFileSystemMutation.reset();
      handleClose();
    },
    handleSubmit,
  };
};

export type UseCreateFileSystemReturn = ReturnType<typeof useCreateFileSystem>;