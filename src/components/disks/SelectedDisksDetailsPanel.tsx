import { Box, Typography } from '@mui/material';
import type { DiskInventoryItem } from '../../@types/disk';
import DetailComparisonPanel, {
  type DetailComparisonColumn,
  type DetailComparisonStatus,
} from '../common/DetailComparisonPanel';
import type { DiskDetailItemState } from '../../hooks/useDiskInventory';
import { formatBytes } from '../../utils/formatters';
import formatDetailValue from '../../utils/formatDetailValue';

interface SelectedDisksDetailsPanelProps {
  items: DiskDetailItemState[];
  onRemove: (diskName: string) => void;
}

const formatPercent = (value: number | null | undefined) => {
  if (value == null || Number.isNaN(value)) {
    return '-';
  }

  return `${Number(value).toFixed(2)}٪`;
};

const formatBoolean = (value: boolean | null | undefined) => {
  if (value == null) {
    return '-';
  }

  return value ? 'بله' : 'خیر';
};

const formatBlockSize = (value: string | number | null | undefined) => {
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

const formatNullableString = (value: unknown) => {
  const normalized = String(value ?? '').trim();
  return normalized.length > 0 ? normalized : '-';
};

const createPartitionLines = (partitions: DiskInventoryItem['partitions']) => {
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

const createDetailValues = (detail: DiskInventoryItem | null) => {
  if (!detail) {
    return {};
  }

  const values: Record<string, unknown> = {};

  const assignValue = (label: string, value: unknown) => {
    values[label] = value ?? '-';
  };

  assignValue('نام دیسک', formatNullableString(detail.disk));
  assignValue('مدل', formatNullableString(detail.model));
  assignValue('فروشنده', formatNullableString(detail.vendor));
  assignValue('وضعیت', formatNullableString(detail.state));
  assignValue('مسیر دستگاه', formatNullableString(detail.device_path));
  assignValue('اندازه بلاک فیزیکی', formatBlockSize(detail.physical_block_size));
  assignValue('اندازه بلاک منطقی', formatBlockSize(detail.logical_block_size));
  assignValue('زمان‌بندی', formatNullableString(detail.scheduler));
  assignValue('WWID', formatNullableString(detail.wwid));
  assignValue('شناسه WWN', formatNullableString(detail.wwn));
  assignValue('حجم کل', formatBytes(detail.total_bytes, { fallback: '-' }));
  assignValue('حجم استفاده‌شده', formatBytes(detail.used_bytes, { fallback: '-' }));
  assignValue('حجم آزاد', formatBytes(detail.free_bytes, { fallback: '-' }));
  assignValue('درصد استفاده', formatPercent(detail.usage_percent));
  assignValue('دمای فعلی',
    detail.temperature_celsius == null
      ? '-'
      : `${detail.temperature_celsius} درجه`
  );
  assignValue('UUID', formatNullableString(detail.uuid));
  assignValue('شماره اسلات', formatNullableString(detail.slot_number));
  assignValue('نوع دیسک', formatNullableString(detail.type));
  assignValue('دارای پارتیشن', formatBoolean(detail.has_partition));
  assignValue('پارتیشن‌ها', createPartitionLines(detail.partitions));

  return values;
};

const formatDiskDetailValue = (value: unknown) => {
  const formatted = formatDetailValue(value);

  if (typeof formatted === 'string' && formatted.includes('\n')) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {formatted.split('\n').map((line, index) => (
          <Typography key={`${line}-${index}`} sx={{ fontSize: '0.85rem', textAlign: 'right' }}>
            {line}
          </Typography>
        ))}
      </Box>
    );
  }

  return formatted;
};

const SelectedDisksDetailsPanel = ({ items, onRemove }: SelectedDisksDetailsPanelProps) => {
  const columns: DetailComparisonColumn[] = items.map((item) => {
    let status: DetailComparisonStatus | undefined;

    if (item.isLoading || item.isFetching) {
      status = { type: 'loading', message: 'در حال دریافت جزئیات...' };
    } else if (item.error) {
      status = { type: 'error', message: item.error.message };
    } else if (!item.detail) {
      status = { type: 'info', message: 'اطلاعاتی در دسترس نیست.' };
    }

    return {
      id: item.diskName,
      title: item.diskName,
      onRemove: () => onRemove(item.diskName),
      values: createDetailValues(item.detail),
      status,
    };
  });

  const title =
    columns.length > 1 ? 'مقایسه جزئیات دیسک‌ها' : 'جزئیات دیسک‌ها';

  return (
    <DetailComparisonPanel
      title={title}
      attributeLabel="ویژگی"
      columns={columns}
      formatValue={formatDiskDetailValue}
      emptyStateMessage="اطلاعاتی برای نمایش وجود ندارد."
      attributeSort={(a, b) => a.localeCompare(b, 'fa-IR')}
    />
  );
};

export default SelectedDisksDetailsPanel;