import type { DiskInventoryItem } from '../@types/disk';
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

export const createPartitionLines = (partitions: DiskInventoryItem['partitions']) => {
  if (!Array.isArray(partitions) || partitions.length === 0) {
    return '-';
  }

  return partitions
    .map((partition) => {
      const name = formatNullableString(partition?.name);
      const size = formatBytes(partition?.size_bytes, { fallback: '-' });
      const mountPoint = formatNullableString(partition?.mount_point);
      const filesystem = formatNullableString(partition?.filesystem);
      return `${name} | ${size} | نقطه مونت: ${mountPoint} | فایل‌سیستم: ${filesystem}`;
    })
    .join('\n');
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
  assignValue('پارتیشن‌ها', detail.partitions, createPartitionLines);

  return values;
};