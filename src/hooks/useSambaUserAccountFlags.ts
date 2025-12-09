import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import type { SambaUserAccountStatus } from '../@types/samba';
import { fetchSambaUserAccountFlags } from '../lib/sambaUserService';

export const sambaUserAccountFlagsQueryKey = (username: string) =>
  ['samba-user', username, 'account-flags'] as const;

const resolveAccountStatus = (
  accountFlags: string | null
): SambaUserAccountStatus => {
  if (!accountFlags) {
    return 'unknown';
  }

  const normalizedFlags = accountFlags.trim();

  if (normalizedFlags === '[U          ]') {
    return 'enabled';
  }

  if (normalizedFlags === '[DU         ]') {
    return 'disabled';
  }

  return 'unknown';
};

interface UseSambaUserAccountFlagsOptions {
  usernames: string[];
  enabled?: boolean;
}

export const useSambaUserAccountFlags = ({
  usernames,
  enabled = true,
}: UseSambaUserAccountFlagsOptions) => {
  const normalizedUsernames = useMemo(
    () => Array.from(new Set(usernames.filter((username) => username))),
    [usernames]
  );

  const queries = useQueries({
    queries: normalizedUsernames.map((username) => ({
      queryKey: sambaUserAccountFlagsQueryKey(username),
      queryFn: () => fetchSambaUserAccountFlags(username),
      enabled,
    })),
  });

  const statusByUsername = useMemo(() => {
    return normalizedUsernames.reduce<Record<string, SambaUserAccountStatus>>(
      (acc, username, index) => {
        const flags = queries[index]?.data ?? null;
        acc[username] = resolveAccountStatus(flags);
        return acc;
      },
      {}
    );
  }, [normalizedUsernames, queries]);

  const isLoading = queries.some((query) => query.isLoading);
  const isFetching = queries.some((query) => query.isFetching);

  return {
    statusByUsername,
    isLoading,
    isFetching,
  };
};

export default useSambaUserAccountFlags;
