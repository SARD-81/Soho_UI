import type {
  CreateSambaUserPayload,
  SambaUsersResponse,
  SambaUserUpdateAction,
  UpdateSambaUserPayload,
} from '../@types/samba';
import axiosInstance from './axiosInstance';

const SAMBA_USERS_BASE_URL = '/api/samba/users/';

export const fetchSambaUsers = async ({
  signal,
}: {
  signal?: AbortSignal;
}): Promise<SambaUsersResponse> => {
  const { data } = await axiosInstance.get<SambaUsersResponse>(
    SAMBA_USERS_BASE_URL,
    {
      params: { property: 'all', save_to_db: true },
      signal,
    }
  );

  return data;
};

export const fetchSambaUserAccountFlags = async (
  username: string
): Promise<string | null> => {
  const encodedUsername = encodeURIComponent(username);

  const { data } = await axiosInstance.get<{ data?: unknown }>(
    `${SAMBA_USERS_BASE_URL}${encodedUsername}/`,
    {
      params: { property: 'Account Flags' },
    }
  );

  const extractAccountFlags = (raw: unknown): string | null => {
    if (typeof raw === 'string') {
      return raw;
    }

    if (Array.isArray(raw)) {
      const firstStringEntry = raw.find((entry) => typeof entry === 'string');
      return typeof firstStringEntry === 'string' ? firstStringEntry : null;
    }

    if (raw && typeof raw === 'object') {
      const objectValue = raw as Record<string, unknown>;

      if (typeof objectValue['Account Flags'] === 'string') {
        return objectValue['Account Flags'];
      }

      const firstStringValue = Object.values(objectValue).find(
        (value) => typeof value === 'string'
      );

      if (typeof firstStringValue === 'string') {
        return firstStringValue;
      }
    }

    return null;
  };

  return extractAccountFlags(data?.data);
};

export const createSambaUser = async ({
  username,
  password,
  save_to_db = true,
}: CreateSambaUserPayload): Promise<void> => {
  await axiosInstance.post(SAMBA_USERS_BASE_URL, {
    username,
    password,
    save_to_db,
  });
};

export const deleteSambaUser = async (username: string): Promise<void> => {
  const encodedUsername = encodeURIComponent(username);

  await axiosInstance.delete(`${SAMBA_USERS_BASE_URL}${encodedUsername}/`, {
    params: { save_to_db: true },
  });
};

export const updateSambaUser = async ({
  username,
  action,
  new_password,
  save_to_db = false,
}: UpdateSambaUserPayload): Promise<void> => {
  const encodedUsername = encodeURIComponent(username);
  const payload: Record<string, string | SambaUserUpdateAction | boolean> = {
    action,
    save_to_db,
  };

  if (action === 'change_password' && new_password) {
    payload.new_password = new_password;
  }

  await axiosInstance.put(`${SAMBA_USERS_BASE_URL}${encodedUsername}/update/`, {
    ...payload,
  });
};

export const sambaUserService = {
  fetchSambaUsers,
  createSambaUser,
  deleteSambaUser,
  updateSambaUser,
  fetchSambaUserAccountFlags,
};

export default sambaUserService;
