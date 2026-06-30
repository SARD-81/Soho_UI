import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FormEvent, MouseEvent } from 'react';
import { useCallback, useState } from 'react';
import axiosInstance from '../lib/axiosInstance';
import extractApiErrorMessage from '../utils/apiError';

const DEFAULT_IMPORT_POOL_ERROR_MESSAGE = 'امکان درون‌ریزی فضای یکپارچه وجود ندارد.';
const DEFAULT_IMPORTABLE_POOLS_ERROR_MESSAGE = 'امکان دریافت فهرست فضاهای قابل فراخوانی وجود ندارد.';

export const importablePoolsQueryKey = ['zpool', 'importable'] as const;

export interface ImportablePoolEntry {
  id: string;
  name: string;
  raw: unknown;
}

interface ImportPoolPayload {
  pool_name: string;
  save_to_db: boolean;
}

interface UseImportPoolOptions {
  onSuccess?: (poolName: string) => void;
  onError?: (error: Error, poolName: string) => void;
}

const extractPoolName = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value.trim() || null;
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const candidateKeys = ['name', 'pool_name', 'poolName', 'pool', 'id'];

  for (const key of candidateKeys) {
    const candidate = record[key];
    if (typeof candidate === 'string' || typeof candidate === 'number') {
      const resolvedName = String(candidate).trim();
      if (resolvedName) {
        return resolvedName;
      }
    }
  }

  return null;
};

const normalizeImportablePools = (payload: unknown): ImportablePoolEntry[] => {
  const responseBody =
    payload && typeof payload === 'object' && 'data' in payload
      ? (payload as { data: unknown }).data
      : payload;

  const rawItems = Array.isArray(responseBody)
    ? responseBody
    : responseBody && typeof responseBody === 'object'
      ? Object.entries(responseBody as Record<string, unknown>).map(([key, value]) => {
          if (value && typeof value === 'object') {
            return { id: key, ...(value as Record<string, unknown>) };
          }

          return { id: key, name: value };
        })
      : [];

  return rawItems
    .map((item, index): ImportablePoolEntry | null => {
      const name = extractPoolName(item);
      if (!name) {
        return null;
      }

      const id =
        item && typeof item === 'object' && 'id' in item
          ? String((item as { id: unknown }).id ?? name)
          : name;

      return {
        id: `${id}-${index}`,
        name,
        raw: item,
      };
    })
    .filter((item): item is ImportablePoolEntry => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const useImportPool = ({ onSuccess, onError }: UseImportPoolOptions = {}) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [poolName, setPoolName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const importablePoolsQuery = useQuery<ImportablePoolEntry[], Error>({
    queryKey: importablePoolsQueryKey,
    enabled: isOpen,
    queryFn: async () => {
      try {
        const response = await axiosInstance.get<unknown>('/api/zpool/import/');
        return normalizeImportablePools(response.data);
      } catch (error) {
        throw new Error(
          extractApiErrorMessage(error, DEFAULT_IMPORTABLE_POOLS_ERROR_MESSAGE)
        );
      }
    },
  });

  const importMutation = useMutation<unknown, Error, ImportPoolPayload>({
    mutationFn: async (payload) => {
      try {
        await axiosInstance.post('/api/zpool/import/', payload);
      } catch (error) {
        throw new Error(extractApiErrorMessage(error, DEFAULT_IMPORT_POOL_ERROR_MESSAGE));
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['zpool'] });
      queryClient.invalidateQueries({ queryKey: importablePoolsQueryKey });
      onSuccess?.(variables.pool_name);
      handleClose();
    },
    onError: (error, variables) => {
      const resolvedPoolName = variables?.pool_name ?? poolName.trim();
      setErrorMessage(error.message);
      onError?.(error, resolvedPoolName);
    },
  });

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setPoolName('');
    setErrorMessage(null);
    importMutation.reset();
  }, [importMutation]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setPoolName('');
    setErrorMessage(null);
    importMutation.reset();
  }, [importMutation]);

  const handleSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>) => {
      event?.preventDefault();
      const trimmedName = poolName.trim();

      if (!trimmedName) {
        setErrorMessage('لطفاً نام فضای یکپارچه را وارد کنید.');
        return;
      }

      setErrorMessage(null);

      importMutation.mutate({ pool_name: trimmedName, save_to_db: true });
    },
    [importMutation, poolName]
  );

  return {
    isOpen,
    poolName,
    errorMessage,
    isImporting: importMutation.isPending,
    importablePools: importablePoolsQuery.data ?? [],
    isImportablePoolsLoading: importablePoolsQuery.isFetching,
    importablePoolsError: importablePoolsQuery.error,
    refetchImportablePools: importablePoolsQuery.refetch,
    setPoolName,
    openModal: handleOpen,
    closeModal: handleClose,
    handleSubmit,
  };
};

export type UseImportPoolReturn = ReturnType<typeof useImportPool>;
