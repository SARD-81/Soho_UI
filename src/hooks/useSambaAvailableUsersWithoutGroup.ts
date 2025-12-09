import { useQuery } from '@tanstack/react-query';
import { fetchSambaGroupsMembersList } from '../lib/sambaGroupService';
import { fetchSambaUsernames } from '../lib/sambaUserService';

export const sambaAvailableUsersQueryKey = ['samba-users-without-group'] as const;

const buildUniqueList = (items: string[]) =>
  Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));

export const useSambaAvailableUsersWithoutGroup = ({
  enabled = true,
}: { enabled?: boolean } = {}) =>
  useQuery<string[], Error>({
    queryKey: sambaAvailableUsersQueryKey,
    enabled,
    staleTime: 15000,
    queryFn: async ({ signal }) => {
      const [groups, usernames] = await Promise.all([
        fetchSambaGroupsMembersList({ signal }),
        fetchSambaUsernames({ signal }),
      ]);

      const groupedUsers = new Set<string>();
      groups.forEach((group) => {
        group.members.forEach((member) => groupedUsers.add(member.trim().toLowerCase()));
      });

      const filtered = usernames.filter((username) => {
        const normalized = username.trim().toLowerCase();
        return normalized.length > 0 && !groupedUsers.has(normalized);
      });

      return buildUniqueList(filtered);
    },
  });

export type UseSambaAvailableUsersWithoutGroupReturn = ReturnType<
  typeof useSambaAvailableUsersWithoutGroup
>;
