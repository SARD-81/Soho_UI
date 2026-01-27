import type { NfsShareEntry, NfsSharesResponse } from '../@types/nfs';

export const normalizeClients = (clients: unknown): NfsShareEntry['clients'] => {
  if (!Array.isArray(clients)) {
    return [];
  }

  return clients
    .map((client) => {
      if (!client || typeof client !== 'object') {
        return null;
      }

      const entry = client as { client?: unknown; options?: unknown };

      return {
        client: typeof entry.client === 'string' ? entry.client : '',
        options:
          entry.options && typeof entry.options === 'object'
            ? (entry.options as Record<string, unknown>)
            : {},
      };
    })
    .filter((client): client is NfsShareEntry['clients'][number] => Boolean(client));
};

export const mapNfsShares = (
  response: NfsSharesResponse | undefined
): NfsShareEntry[] => {
  const shares = response?.data ?? [];

  return shares
    .map((share) => ({
      path: share.path,
      clients: normalizeClients(share.clients),
    }))
    .sort((a, b) => a.path.localeCompare(b.path, 'fa-IR'));
};
