import { useQuery } from '@tanstack/react-query';
import type { SambaGroupEntry } from '../@types/samba';
import { fetchSambaGroupMembers } from '../lib/sambaGroupService';

export const sambaGroupMembersQueryKey = (groupname: string) => [
  'samba-group-members',
  groupname,
];

export const useSambaGroupMembers = (
  groupname: string | null,
  { enabled = true }: { enabled?: boolean } = {}
) =>
  useQuery<SambaGroupEntry | null, Error>({
    queryKey: sambaGroupMembersQueryKey(groupname ?? ''),
    queryFn: ({ signal }) =>
      groupname ? fetchSambaGroupMembers(groupname, { signal }) : Promise.resolve(null),
    enabled: Boolean(groupname) && enabled,
    staleTime: 15000,
  });

export type UseSambaGroupMembersReturn = ReturnType<typeof useSambaGroupMembers>;