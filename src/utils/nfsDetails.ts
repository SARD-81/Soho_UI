import type { NestedDetailTableData } from '../@types/detailComparison';
import type { NfsShareClientEntry, NfsShareEntry } from '../@types/nfs';
import { translateDetailKey } from './detailLabels';

const buildClientTitle = (client: NfsShareClientEntry, index: number) => {
  const trimmed = typeof client.client === 'string' ? client.client.trim() : '';
  return trimmed || `کلاینت ${index + 1}`;
};

const buildOptionRows = (options: Record<string, unknown> | undefined) => {
  if (!options) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(options).map(([key, value]) => [
      translateDetailKey(key),
      value,
    ])
  );
};

export const createNfsOptionsTable = (
  clients: NfsShareClientEntry[]
): NestedDetailTableData => {
  if (!clients.length) {
    return {
      type: 'nested-detail-table',
      attributeLabel: 'ویژگی',
      emptyStateMessage: 'گزینه‌ای برای نمایش وجود ندارد.',
      columns: [],
    };
  }

  const columns = clients.map((client, index) => ({
    id: client.client || `client-${index + 1}`,
    title: buildClientTitle(client, index),
    values: buildOptionRows(client.options ?? undefined),
  }));

  return {
    type: 'nested-detail-table',
    attributeLabel: 'ویژگی',
    emptyStateMessage: 'گزینه‌ای برای نمایش وجود ندارد.',
    columns,
  };
};

export const buildNfsShareDetailValues = (
  share: NfsShareEntry
): Record<string, unknown> => ({
  path: share.path,
  clients: share.clients.map((client) => client.client).filter(Boolean),
  options: createNfsOptionsTable(share.clients),
});
