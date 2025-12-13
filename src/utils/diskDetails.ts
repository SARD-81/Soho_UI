import type { DiskInventoryItem } from '../@types/disk';
import type { NestedDetailTableData } from '../@types/detailComparison';
import { formatBytes } from './formatters';

export const formatNullableString = (value: unknown) => {
  const normalized = String(value ?? '').trim();
  return normalized.length > 0 ? normalized : '-';
};

export const formatPercent = (value: number | null | undefined) => {
  if (value == null || Number.isNaN(value)) {
    return '-';
  }

  return `${Number(value).toFixed(2)}٪`;
};

export const formatBoolean = (value: boolean | null | undefined) => {
  if (value == null) {
    return '-';
  }

  return value ? 'بله' : 'خیر';
};

export const formatBlockSize = (value: string | number | null | undefined) => {
  if (value == null) {
    return '-';
  }

  const numericValue = Number(value);

  if (Number.isFinite(numericValue)) {
    return `${numericValue} بایت`;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : '-';
};

export const createPartitionsTable = (
  partitions: DiskInventoryItem['partitions']
): NestedDetailTableData | '-' => {
  if (!Array.isArray(partitions) || partitions.length === 0) {
    return '-';
  }

  const rows: Array<{ key: keyof NonNullable<DiskInventoryItem['partitions']>[number]; label: string }> = [
    { key: 'name', label: 'نام پارتیشن' },
    { key: 'path', label: 'مسیر' },
    { key: 'size_bytes', label: 'حجم' },
    { key: 'mount_point', label: 'نقطه مونت' },
    { key: 'filesystem', label: 'فایل‌سیستم' },
    { key: 'wwn', label: 'شناسه WWN' },
  ];

  const columns = partitions.map((partition, index) => {
    const values: Record<string, unknown> = {};

    rows.forEach((row) => {
      const rawValue = partition?.[row.key];

      if (row.key === 'size_bytes') {
        values[row.label] = formatBytes(rawValue, { fallback: '-' });
        return;
      }

      values[row.label] = formatNullableString(rawValue);
    });

    const title = formatNullableString(partition?.name);
    const path = formatNullableString(partition?.path);

    return {
      id: path === '-' ? `partition-${index}` : path,
      title: title === '-' ? `پارتیشن ${index + 1}` : title,
      values,
    };
  });

  return {
    type: 'nested-detail-table',
    attributeLabel: 'ویژگی پارتیشن',
    emptyStateMessage: 'پارتیشنی برای نمایش وجود ندارد.',
    columns,
  };
};

export const buildDiskDetailValues = (
  detail: DiskInventoryItem | null
): Record<string, unknown> => {
  if (!detail) {
    return {};
  }

  const values: Record<string, unknown> = {};

  const assignValue = <T>(
    label: string,
    rawValue: T,
    formatter: (value: NonNullable<T>) => unknown = (value) => value
  ) => {
    if (rawValue == null) {
      return;
    }

    values[label] = formatter(rawValue as NonNullable<T>);
  };

  assignValue('نام دیسک', detail.disk, formatNullableString);
  assignValue('مدل', detail.model, formatNullableString);
  assignValue('فروشنده', detail.vendor, formatNullableString);
  assignValue('وضعیت', detail.state, formatNullableString);
  assignValue('مسیر دستگاه', detail.device_path, formatNullableString);
  assignValue('اندازه بلاک فیزیکی', detail.physical_block_size, formatBlockSize);
  assignValue('اندازه بلاک منطقی', detail.logical_block_size, formatBlockSize);
  assignValue('زمان‌بندی', detail.scheduler, formatNullableString);
  assignValue('WWID', detail.wwid, formatNullableString);
  assignValue('شناسه WWN', detail.wwn, formatNullableString);
  assignValue('حجم کل', detail.total_bytes, (value) =>
    formatBytes(value, { fallback: '-' })
  );
  assignValue('حجم استفاده‌شده', detail.used_bytes, (value) =>
    formatBytes(value, { fallback: '-' })
  );
  assignValue('حجم آزاد', detail.free_bytes, (value) =>
    formatBytes(value, { fallback: '-' })
  );
  assignValue('درصد استفاده', detail.usage_percent, formatPercent);
  assignValue('دمای فعلی', detail.temperature_celsius, (temperature) =>
    `${temperature} درجه`
  );
  assignValue('UUID', detail.uuid, formatNullableString);
  assignValue('شماره اسلات', detail.slot_number, formatNullableString);
  assignValue('نوع دیسک', detail.type, formatNullableString);
  assignValue('دارای پارتیشن', detail.has_partition, formatBoolean);
  assignValue('پارتیشن‌ها', detail.partitions, createPartitionsTable);

  return values;
};
