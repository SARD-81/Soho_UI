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
  quota: string;
  reservation: string;
  save_to_db: boolean;
}

interface CreateFileSystemVariables extends CreateFileSystemPayload {
  poolName: string;
  filesystemName: string;
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
  const [quotaUnit, setQuotaUnit] = useState<'G' | 'T'>('G');
  const [poolError, setPoolError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setSelectedPool('');
    setFileSystemName('');
    setQuotaAmount('');
    setQuotaUnit('G');
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
    CreateFileSystemVariables
  >({
    mutationFn: async ({ poolName, filesystemName, ...payload }) => {
      await axiosInstance.post(
        `/api/filesystem/filesystems/${poolName}/${filesystemName}/`,
        payload
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['filesystems'] });
      handleClose();
      onSuccess?.(`${variables.poolName}/${variables.filesystemName}`);
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
      } else if (/^[0-9]/.test(trimmedName)) {
        setNameError('نام فضای فایلی نمی‌تواند با عدد شروع شود.');
        hasError = true;
      }

      if (!trimmedQuota) {
        setQuotaError('حجم فضای فایلی را وارد کنید.');
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

      const sanitizedPool = trimmedPool.replace(/\s+/g, '');
      const sanitizedName = trimmedName.replace(/\s+/g, '');
      const formattedQuota = `${trimmedQuota}${quotaUnit}`;

      const payload: CreateFileSystemVariables = {
        poolName: sanitizedPool,
        filesystemName: sanitizedName,
        quota: formattedQuota,
        reservation: formattedQuota,
        save_to_db: false,
      };

      createFileSystemMutation.mutate(payload);
    },
    [createFileSystemMutation, filesystemName, quotaAmount, quotaUnit, selectedPool]
  );

  return {
    isOpen,
    selectedPool,
    setSelectedPool,
    filesystemName,
    setFileSystemName,
    quotaAmount,
    setQuotaAmount,
    quotaUnit,
    setQuotaUnit,
    poolError,
    setPoolError,
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
    setNameError,
  };
};

export type UseCreateFileSystemReturn = ReturnType<typeof useCreateFileSystem>;