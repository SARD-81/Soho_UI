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

interface CreateFileSystemPayload {
  filesystem_name: string;
  quota: string;
  reservation: string;
}

interface UseCreateFileSystemOptions {
  onSuccess?: (filesystemName: string) => void;
  onError?: (errorMessage: string) => void;
  isFilesystemNameTaken?: (pool: string, filesystemName: string) => boolean;
}

type FilesystemNameStatus = 'idle' | 'available' | 'duplicate' | 'invalid';

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
  isFilesystemNameTaken,
}: UseCreateFileSystemOptions = {}) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState('');
  const [filesystemName, setFileSystemNameState] = useState('');
  const [quotaAmount, setQuotaAmount] = useState('');
  const [poolError, setPoolError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [filesystemNameStatus, setFilesystemNameStatus] =
    useState<FilesystemNameStatus>('idle');

  const isFilesystemNameTakenRef = useRef<
    ((pool: string, filesystemName: string) => boolean) | undefined
  >(isFilesystemNameTaken);

  useEffect(() => {
    isFilesystemNameTakenRef.current = isFilesystemNameTaken;
  }, [isFilesystemNameTaken]);

  const resetForm = useCallback(() => {
    setSelectedPool('');
    setFileSystemNameState('');
    setQuotaAmount('');
    setPoolError(null);
    setNameError(null);
    setQuotaError(null);
    setApiError(null);
    setFilesystemNameStatus('idle');
  }, []);

  const handleOpen = useCallback(() => {
    resetForm();
    setIsOpen(true);
  }, [resetForm]);

  const handleClose = useCallback(() => {
    resetForm();
    setIsOpen(false);
  }, [resetForm]);

  const handleFilesystemNameInput = useCallback(
    (value: string) => {
      setApiError(null);

      const noWhitespace = value.replace(/\s+/g, '');
      const englishOnlyValue = noWhitespace.replace(/[^A-Za-z0-9]/g, '');
      const hadInvalidCharacters = englishOnlyValue !== noWhitespace;

      setFileSystemNameState(englishOnlyValue);

      if (englishOnlyValue.length === 0) {
        setFilesystemNameStatus(hadInvalidCharacters ? 'invalid' : 'idle');
        setNameError(
          hadInvalidCharacters
            ? 'نام فضای فایلی باید فقط شامل حروف انگلیسی و اعداد باشد.'
            : null
        );
        return;
      }

      if (hadInvalidCharacters) {
        setFilesystemNameStatus('invalid');
        setNameError(
          'نام فضای فایلی باید فقط شامل حروف انگلیسی و اعداد باشد.'
        );
        return;
      }

      if (!selectedPool) {
        setFilesystemNameStatus('idle');
        setNameError(null);
        return;
      }

      const isDuplicate =
        isFilesystemNameTakenRef.current?.(selectedPool, englishOnlyValue) ??
        false;

      if (isDuplicate) {
        setFilesystemNameStatus('duplicate');
        setNameError(
          'نام فضای فایلی در این فضای یکپارچه قبلاً استفاده شده است.'
        );
        return;
      }

      setFilesystemNameStatus('available');
      setNameError(null);
    },
    [selectedPool]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!filesystemName) {
      setFilesystemNameStatus('idle');
      setNameError(null);
      return;
    }

    handleFilesystemNameInput(filesystemName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filesystemName, isFilesystemNameTaken, isOpen, selectedPool]);

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
        setFilesystemNameStatus('idle');
        hasError = true;
      }

      if (!hasError && !/^[A-Za-z0-9]+$/.test(trimmedName)) {
        setNameError(
          'نام فضای فایلی باید فقط شامل حروف انگلیسی و اعداد باشد.'
        );
        setFilesystemNameStatus('invalid');
        hasError = true;
      }

      if (!hasError) {
        const isDuplicate =
          isFilesystemNameTakenRef.current?.(trimmedPool, trimmedName) ??
          false;

        if (isDuplicate) {
          setNameError(
            'نام فضای فایلی در این فضای یکپارچه قبلاً استفاده شده است.'
          );
          setFilesystemNameStatus('duplicate');
          hasError = true;
        }
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
    setFileSystemName: handleFilesystemNameInput,
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
    filesystemNameStatus,
  };
};

export type UseCreateFileSystemReturn = ReturnType<typeof useCreateFileSystem>;