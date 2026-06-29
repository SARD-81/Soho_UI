import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';
import axiosInstance from '../lib/axiosInstance';

interface ApiErrorResponse {
  detail?: string;
  message?: string;
  errors?: string | string[];
  ok?: boolean;
  [key: string]: unknown;
}

interface CreateFileSystemPayload {
  pool_name: string;
  fs_name: string;
  quota: string;
  reservation: string;
  mountpoint: string;
  encryption: 'on' | 'off';
  passphrase: string;
  save_to_db: boolean;
}

interface CreateFileSystemSubmitOptions {
  encryptionEnabled?: boolean;
  encryptionPassphrase?: string;
}

interface UseCreateFileSystemOptions {
  onSuccess?: (filesystemName: string) => void;
  onError?: (errorMessage: string) => void;
}

const encodePassphraseToBase64 = (passphrase: string) => {
  const bytes = new TextEncoder().encode(passphrase);
  let binaryValue = '';

  bytes.forEach((byte) => {
    binaryValue += String.fromCharCode(byte);
  });

  return window.btoa(binaryValue);
};

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
    CreateFileSystemPayload
  >({
    mutationFn: async (payload) => {
      await axiosInstance.post('/api/filesystem/', payload, {
        params: { save_to_db: true },
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['filesystems'] });
      handleClose();
      onSuccess?.(`${variables.pool_name}/${variables.fs_name}`);
    },
    onError: (error) => {
      const message = extractApiMessage(error);
      setApiError(message);
      onError?.(message);
    },
  });

  const handleSubmit = useCallback(
    (
      event: FormEvent<HTMLFormElement>,
      options: CreateFileSystemSubmitOptions = {}
    ) => {
      event.preventDefault();
      setPoolError(null);
      setNameError(null);
      setQuotaError(null);
      setApiError(null);

      const trimmedPool = selectedPool.trim();
      const trimmedName = filesystemName.trim();
      const trimmedQuota = quotaAmount.trim();
      const encryptionEnabled = Boolean(options.encryptionEnabled);
      const encryptionPassphrase = options.encryptionPassphrase ?? '';

      let hasError = false;

      if (!trimmedPool) {
        setPoolError('لطفاً فضای یکپارچه مقصد را انتخاب کنید.');
        hasError = true;
      }

      if (!trimmedName) {
        setNameError('نام فضای فایلی را وارد کنید.');
        hasError = true;
      } else if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(trimmedName)) {
        setNameError('نام فضای فایلی باید فقط شامل حروف انگلیسی، اعداد، خط تیره (-) و زیرخط (_) باشد و با حرف انگلیسی شروع شود.');
        hasError = true;
      } else if (/^[0-9_-]/.test(trimmedName)) {
        setNameError('نام فضای فایلی باید با حرف انگلیسی شروع شود.');
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
      const mountpoint = `/${sanitizedPool}/${sanitizedName}`;

      const payload: CreateFileSystemPayload = {
        pool_name: sanitizedPool,
        fs_name: sanitizedName,
        quota: formattedQuota,
        reservation: formattedQuota,
        mountpoint,
        encryption: encryptionEnabled ? 'on' : 'off',
        passphrase: encryptionEnabled
          ? encodePassphraseToBase64(encryptionPassphrase)
          : '',
        save_to_db: true,
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
