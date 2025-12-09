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

  if (typeof data?.data === 'string') {
    return data.data;
  }

  if (Array.isArray(data?.data) && data.data.length > 0) {
    const [firstEntry] = data.data;

    if (typeof firstEntry === 'string') {
      return firstEntry;
    }
  }

  return null;
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
