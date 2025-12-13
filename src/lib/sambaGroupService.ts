import type {
  SambaGroupEntry,
  SambaGroupMembersListEntry,
  SambaGroupMembersListResponse,
  SambaGroupMembersResponse,
  SambaGroupsResponse,
} from '../@types/samba';
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

export const fetchSambaGroupNames = async ({
  signal,
}: { signal?: AbortSignal } = {}): Promise<string[]> => {
  const { data } = await axiosInstance.get<SambaGroupsResponse>(
    SAMBA_GROUPS_BASE_URL,
    {
      params: { property: 'name', contain_system_groups: false },
      signal,
    }
  );

  const rawNames = data?.data ?? [];

  return rawNames
    .map((entry) => {
      if (typeof entry === 'string') {
        return entry;
      }

      if (entry && typeof entry === 'object' && 'name' in entry) {
        const nameValue = (entry as { name?: unknown }).name;
        return typeof nameValue === 'string' ? nameValue : null;
      }

      return null;
    })
    .filter((name): name is string => Boolean(name))
    .sort((a, b) => a.localeCompare(b, 'fa'));
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

export const fetchSambaGroupMembers = async (
  groupname: string,
  { signal, containSystemGroups = false }: { signal?: AbortSignal; containSystemGroups?: boolean } = {}
): Promise<SambaGroupEntry | null> => {
  const encodedGroupName = encodeURIComponent(groupname);

  const { data } = await axiosInstance.get<SambaGroupMembersResponse>(
    `${SAMBA_GROUPS_BASE_URL}${encodedGroupName}/`,
    {
      params: { property: 'members', contain_system_groups: containSystemGroups },
      signal,
    }
  );

  const group = data?.data;

  if (!group) return null;

  const resolvedName = (group as SambaGroupMembersListEntry).groupname || group.name;

  return {
    ...group,
    name: resolvedName || groupname,
    members: group.members ?? [],
  };
};

export const fetchSambaGroupsMembersList = async ({
  signal,
}: { signal?: AbortSignal } = {}): Promise<Pick<SambaGroupEntry, 'name' | 'members'>[]> => {
  const { data } = await axiosInstance.get<SambaGroupMembersListResponse>(
    SAMBA_GROUPS_BASE_URL,
    {
      params: { property: 'members', contain_system_groups: false },
      signal,
    }
  );

  const rawGroups = data?.data ?? [];

  return rawGroups
    .map((entry: SambaGroupMembersListEntry) => {
      const resolvedName = entry.name || entry.groupname || '';

      return {
        name: resolvedName,
        members: entry.members ?? [],
      };
    })
    .filter((entry) => entry.name.trim().length > 0);
};

export const sambaGroupService = {
  fetchSambaGroups,
  fetchSambaGroupNames,
  createSambaGroup,
  deleteSambaGroup,
  updateSambaGroupMember,
  fetchSambaGroupMembers,
  fetchSambaGroupsMembersList,
};

export default sambaGroupService;