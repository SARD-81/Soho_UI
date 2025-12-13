import type { NestedDetailTableColumn, NestedDetailTableData } from '../@types/detailComparison';

interface PoolDiskRecord {
  disk_name?: string | null;
  status?: string | null;
  vdev_type?: string | null;
  type?: string | null;
  full_path_name?: string | null;
  full_disk_name?: string | null;
  wwn?: string | null;
  full_path_wwn?: string | null;
  full_disk_wwn?: string | null;
}

const POOL_DISK_TABLE_CONFIG = {
  attributeLabel: 'ویژگی',
  emptyStateMessage: 'دیسکی برای این فضا ثبت نشده است.',
  columns: [
    {
      key: 'status' as const,
      label: 'وضعیت',
    },
    {
      key: 'vdev_type' as const,
      label: 'نوع vdev',
      fallbacks: ['type' as const],
    },
    {
      key: 'full_path_name' as const,
      label: 'Device',
      fallbacks: ['full_disk_name' as const],
    },
    {
      key: 'wwn' as const,
      label: 'WWN',
      fallbacks: ['full_path_wwn' as const, 'full_disk_wwn' as const],
    },
  ],
} as const;

const POOL_DISK_ATTRIBUTE_PRIORITY = POOL_DISK_TABLE_CONFIG.columns.map(
  ({ label }) => label
);

export const sortPoolDiskAttributes = (a: string, b: string) => {
  const indexA = POOL_DISK_ATTRIBUTE_PRIORITY.indexOf(a);
  const indexB = POOL_DISK_ATTRIBUTE_PRIORITY.indexOf(b);

  if (indexA === -1 && indexB === -1) {
    return a.localeCompare(b, 'fa-IR');
  }

  if (indexA === -1) return 1;
  if (indexB === -1) return -1;

  return indexA - indexB;
};

const resolveColumnTitle = (disk: PoolDiskRecord, index: number) =>
  disk.disk_name?.trim() ||
  disk.full_path_name?.trim() ||
  disk.full_disk_name?.trim() ||
  `دیسک ${index + 1}`;

const resolveDiskValue = (
  disk: PoolDiskRecord,
  key: keyof PoolDiskRecord,
  fallbacks: Array<keyof PoolDiskRecord> = []
) => {
  if (disk[key]) {
    return disk[key];
  }

  for (const fallbackKey of fallbacks) {
    if (disk[fallbackKey]) {
      return disk[fallbackKey];
    }
  }

  return '-';
};

export const buildPoolDiskComparisonTable = (
  disks: unknown
): NestedDetailTableData | null => {
  if (!Array.isArray(disks)) {
    return null;
  }

  const columns: NestedDetailTableColumn[] = disks
    .map((disk, index) => {
      if (!disk || typeof disk !== 'object') {
        return null;
      }

      const diskRecord = disk as PoolDiskRecord;
      const values = POOL_DISK_TABLE_CONFIG.columns.reduce<
        Record<string, string | null>
      >((acc, config) => {
        acc[config.label] = resolveDiskValue(
          diskRecord,
          config.key,
          config.fallbacks
        );

        return acc;
      }, {});

      return {
        id: `${diskRecord.disk_name ?? index}`,
        title: resolveColumnTitle(diskRecord, index),
        values,
      } satisfies NestedDetailTableColumn;
    })
    .filter((column): column is NestedDetailTableColumn => Boolean(column));

  return {
    type: 'nested-detail-table',
    attributeLabel: POOL_DISK_TABLE_CONFIG.attributeLabel,
    emptyStateMessage: POOL_DISK_TABLE_CONFIG.emptyStateMessage,
    columns,
  } satisfies NestedDetailTableData;
};

export default POOL_DISK_TABLE_CONFIG;
