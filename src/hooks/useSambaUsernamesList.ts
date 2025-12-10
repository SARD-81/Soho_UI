import { useQuery } from '@tanstack/react-query';
import { fetchSambaUsernames } from '../lib/sambaUserService';

export const sambaUsernamesListQueryKey = ['samba', 'usernames', 'unix'] as const;

export const useSambaUsernamesList = ({
  enabled = true,
}: { enabled?: boolean } = {}) =>
  useQuery<string[], Error>({
    queryKey: sambaUsernamesListQueryKey,
    queryFn: () => fetchSambaUsernames(),
    staleTime: 10000,
    enabled,
  });

export type UseSambaUsernamesListReturn = ReturnType<typeof useSambaUsernamesList>;
