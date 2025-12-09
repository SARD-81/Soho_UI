import { useQuery } from '@tanstack/react-query';
import type { SambaGroupEntry } from '../@types/samba';
import { fetchSambaGroups } from '../lib/sambaGroupService';

export const sambaGroupsQueryKey = ['samba-groups'] as const;

export const useSambaGroups = ({ enabled = true } = {}) =>
  useQuery<SambaGroupEntry[], Error>({
    queryKey: sambaGroupsQueryKey,
    queryFn: ({ signal }) => fetchSambaGroups({ signal }),
    enabled,
    staleTime: 15000,
  });

export type UseSambaGroupsReturn = ReturnType<typeof useSambaGroups>;