import type {
  CreateDirectoryPermissionsPayload,
  CreateShareWithPermissionsPayload,
  CreateSambaSharePayload,
} from '../@types/samba';
import axiosInstance from './axiosInstance';

export const DEFAULT_SHARE_DIRECTORY_MODE = '0700';

const createDirectoryWithPermissions = async ({
  path,
  mode = DEFAULT_SHARE_DIRECTORY_MODE,
  owner,
  group,
}: CreateDirectoryPermissionsPayload) => {
  await axiosInstance.post('/api/dir/create/permissions/', {
    path,
    mode,
    owner,
    group,
  });
};

const createSambaShare = async (payload: CreateSambaSharePayload) => {
  await axiosInstance.post('/api/samba/create/', payload);
};

export const createShareWithDirectoryPermissions = async ({
  full_path,
  valid_users,
  mode = DEFAULT_SHARE_DIRECTORY_MODE,
}: CreateShareWithPermissionsPayload) => {
  const sanitizedUser = valid_users.trim();

  await createDirectoryWithPermissions({
    path: full_path,
    mode,
    owner: sanitizedUser,
    group: sanitizedUser,
  });

  await createSambaShare({
    full_path,
    valid_users,
  });
};
