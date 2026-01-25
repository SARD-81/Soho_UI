import type { NestedDetailTableData } from '../@types/detailComparison';
import type { ZpoolDetailEntry } from '../@types/zpool';
import { formatNullableString } from './diskDetails';
import { localizeDetailEntries, translateDetailKey } from './detailLabels';

const DISK_ATTRIBUTE_ORDER = [
  'نام دیسک',
  'اسلات',
  'وضعیت',
  'نوع vdev',
  'Device',
  'WWN',
];

interface PoolDiskRow {
  [key: string]: unknown;
  disk_name?: unknown;
  status?: unknown;
  vdev_type?: unknown;
  type?: unknown;
  full_path_name?: unknown;
  full_disk_name?: unknown;
  wwn?: unknown;
  full_path_wwn?: unknown;
  full_disk_wwn?: unknown;
  slot_number?: unknown;
  slot?: unknown;
}

type DiskValueResolver = (disk: PoolDiskRow) => unknown;

const DISK_VALUE_ROWS: Array<{ label: string; resolver: DiskValueResolver }> = [
  { label: 'نام دیسک', resolver: (disk) => disk.disk_name },
  { label: 'وضعیت', resolver: (disk) => disk.status },
  {
    label: 'اسلات',
    resolver: (disk) => disk.slot_number ?? disk.slot,
  },
  // {
  //   label: 'نوع vdev',
  //   resolver: (disk) => disk.vdev_type ?? disk.type,
  // },
  // {
  //   label: 'Device',
  //   resolver: (disk) => disk.full_path_name ?? disk.full_disk_name,
  // },
  {
    label: 'WWN',
    resolver: (disk) => disk.wwn ?? disk.full_path_wwn ?? disk.full_disk_wwn,
  },
];

const createDiskAttributeSort = (priority: string[]) =>
  (a: string, b: string) => {
    const aIndex = priority.indexOf(a);
    const bIndex = priority.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    return a.localeCompare(b, 'fa-IR');
  };

export const POOL_DISK_ATTRIBUTE_SORT = createDiskAttributeSort(DISK_ATTRIBUTE_ORDER);

export const createPoolDisksTable = (disks: unknown): NestedDetailTableData => {
  if (!Array.isArray(disks)) {
    return {
      type: 'nested-detail-table',
      attributeLabel: 'ویژگی دیسک',
      emptyStateMessage: 'اطلاعات دیسک یافت نشد.',
      columns: [],
    };
  }

  const columns = disks.map((disk, index) => {
    const values: Record<string, string> = {};

    DISK_VALUE_ROWS.forEach(({ label, resolver }) => {
      const resolvedValue = resolver(disk as PoolDiskRow);
      values[label] = formatNullableString(resolvedValue);
    });

    const title = formatNullableString((disk as PoolDiskRow).disk_name);

    return {
      id: title === '-' ? `disk-${index}` : String(title),
      title: title === '-' ? `دیسک ${index + 1}` : title,
      values,
    };
  });

  return {
    type: 'nested-detail-table',
    attributeLabel: 'ویژگی دیسک',
    emptyStateMessage: 'دیسکی برای نمایش وجود ندارد.',
    columns,
  };
};

export const buildPoolDetailValues = (
  detail: ZpoolDetailEntry | null
): Record<string, unknown> => {
  if (!detail) {
    return {};
  }

  const values = localizeDetailEntries(detail);
  const disks = (detail as { disks?: unknown }).disks;
  const disksKey = translateDetailKey('disks');

  if (disks !== undefined) {
    values[disksKey] = createPoolDisksTable(disks);
  }

  return values;
};
