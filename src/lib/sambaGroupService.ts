import type { SambaGroupEntry, SambaGroupsResponse } from '../@types/samba';
import axiosInstance from './axiosInstance';

const SAMBA_GROUPS_BASE_URL = '/api/samba/groups/';

export const fetchSambaGroups = async ({
  signal,
}: {
  signal?: AbortSignal;
}): Promise<SambaGroupEntry[]> => {
  const { data } = await axiosInstance.get<SambaGroupsResponse>(
    SAMBA_GROUPS_BASE_URL,
    {
      params: { property: 'all', contain_system_groups: false },
      signal,
    }
  );

  return data.data ?? [];
};

export const createSambaGroup = async (groupname: string): Promise<void> => {
  await axiosInstance.post(SAMBA_GROUPS_BASE_URL, {
    groupname,
    save_to_db: true,
  });
};

export const deleteSambaGroup = async (groupname: string): Promise<void> => {
  const encodedGroupName = encodeURIComponent(groupname);

  await axiosInstance.delete(`${SAMBA_GROUPS_BASE_URL}${encodedGroupName}/`, {
    params: { save_to_db: true },
  });
};

export const updateSambaGroupMember = async ({
  groupname,
  username,
  action,
}: {
  groupname: string;
  username: string;
  action: 'add' | 'remove';
}): Promise<void> => {
  const encodedGroupName = encodeURIComponent(groupname);
  const actionParam = action === 'add' ? 'add_user' : 'remove_user';

  await axiosInstance.put(
    `${SAMBA_GROUPS_BASE_URL}${encodedGroupName}/update/`,
    undefined,
    {
      params: {
        action: actionParam,
        username,
        save_to_db: true,
      },
    }
  );
};

export const sambaGroupService = {
  fetchSambaGroups,
  createSambaGroup,
  deleteSambaGroup,
  updateSambaGroupMember,
};

export default sambaGroupService;
