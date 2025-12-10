import { useQuery } from '@tanstack/react-query';
import { fetchSambaGroupNames } from '../lib/sambaGroupService';

export const sambaGroupNamesQueryKey = ['samba', 'groups', 'names'] as const;

export const useSambaGroupNames = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery<string[], Error>({
    queryKey: sambaGroupNamesQueryKey,
    queryFn: () => fetchSambaGroupNames(),
    staleTime: 10000,
    enabled,
  });

export type UseSambaGroupNamesReturn = ReturnType<typeof useSambaGroupNames>;
