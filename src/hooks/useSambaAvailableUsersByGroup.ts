import { useQuery } from '@tanstack/react-query';
import { fetchSambaGroupMembers } from '../lib/sambaGroupService';
import { fetchSambaUsernames } from '../lib/sambaUserService';

export const sambaAvailableUsersByGroupQueryKey = (groupname: string | null) => [
  'samba-users-by-group',
  groupname ?? '',
] as const;

const buildUniqueList = (items: string[]) =>
  Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));

const normalizeUsername = (username: string) => username.trim().toLowerCase();

export const useSambaAvailableUsersByGroup = (
  groupname: string | null,
  { enabled = true }: { enabled?: boolean } = {}
) =>
  useQuery<string[], Error>({
    queryKey: sambaAvailableUsersByGroupQueryKey(groupname),
    enabled: Boolean(groupname) && enabled,
    staleTime: 15000,
    queryFn: async ({ signal }) => {
      if (!groupname) {
        return [];
      }

      const [group, usernames] = await Promise.all([
        fetchSambaGroupMembers(groupname, { signal, containSystemGroups: false }),
        fetchSambaUsernames({ signal }),
      ]);

      const members = new Set(
        (group?.members ?? []).map((member) => normalizeUsername(member))
      );

      const filtered = usernames.filter((username) => {
        const normalized = normalizeUsername(username);
        return normalized.length > 0 && !members.has(normalized);
      });

      return buildUniqueList(filtered);
    },
  });

export type UseSambaAvailableUsersByGroupReturn = ReturnType<
  typeof useSambaAvailableUsersByGroup
>;
