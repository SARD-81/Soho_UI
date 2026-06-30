import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';
import { sambaSharesQueryKey } from './useSambaShares';

interface UpdateSharepointPayload {
  shareName: string;
  updates: Record<string, unknown>;
  saveToDb?: boolean;
}

const UPDATE_KEY_MAP: Record<string, string> = {
  'read only': 'read_only',
  read_only: 'read_only',
  available: 'available',
  'guest ok': 'guest_ok',
  guest_ok: 'guest_ok',
  browseable: 'browseable',
  'max connections': 'max_connections',
  max_connections: 'max_connections',
  'valid users': 'valid_users',
  valid_users: 'valid_users',
  'create mask': 'create_mask',
  create_mask: 'create_mask',
  'directory mask': 'directory_mask',
  directory_mask: 'directory_mask',
  'inherit permissions': 'inherit_permissions',
  inherit_permissions: 'inherit_permissions',
};

const NUMBER_FIELDS = new Set(['max_connections']);

const normalizeUpdateValue = (key: string, value: unknown) => {
  if (NUMBER_FIELDS.has(key)) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : value;
  }

  return value;
};

const normalizeUpdates = (
  updates: Record<string, unknown>,
  saveToDb: boolean
): Record<string, unknown> => {
  const normalizedUpdates = Object.entries(updates).reduce<Record<string, unknown>>(
    (acc, [key, value]) => {
      const normalizedKey = UPDATE_KEY_MAP[key] ?? key;
      acc[normalizedKey] = normalizeUpdateValue(normalizedKey, value);
      return acc;
    },
    {}
  );

  return {
    ...normalizedUpdates,
    save_to_db: saveToDb,
  };
};

const updateSharepointRequest = async ({
  shareName,
  updates,
  saveToDb = false,
}: UpdateSharepointPayload) => {
  const encodedName = encodeURIComponent(shareName);
  await axiosInstance.put(
    `/api/samba/sharepoints/${encodedName}/update/`,
    normalizeUpdates(updates, saveToDb)
  );
};

export const useUpdateSharepoint = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, UpdateSharepointPayload>({
    mutationFn: updateSharepointRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sambaSharesQueryKey });
    },
  });
};

export type UseUpdateSharepointReturn = ReturnType<typeof useUpdateSharepoint>;
