import { Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import type { DiskInventoryItem, DiskPartitionInfo } from '../../@types/disk';
import { formatBytes } from '../../utils/formatters';
import KeyValueCard, { type KeyValueRow } from '../common/KeyValueCard';
import ArrayTableSection, { type ColumnDef } from '../common/ArrayTableSection';
import {
  buildDiskDetailValues,
  formatNullableString,
  formatPercent,
} from '../../utils/diskDetails';

interface DiskInlineDetailProps {
  disk: DiskInventoryItem;
  isLoading: boolean;
  error: Error | null;
}

const DiskInlineDetail = ({ disk, isLoading, error }: DiskInlineDetailProps) => {
  if (isLoading) {
    return (
      <Box sx={{ p: 2.5, px: 3 }}>
        <Typography sx={{ color: 'var(--color-secondary)' }}>
          در حال دریافت جزئیات {disk.disk}...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2.5, px: 3 }}>
        <Typography sx={{ color: 'var(--color-error)', fontWeight: 700 }}>
          خطا در دریافت جزئیات: {error.message}
        </Typography>
      </Box>
    );
  }

  const values = buildDiskDetailValues(disk);
  const rows: KeyValueRow[] = Object.entries(values).map(([label, value]) => ({
    label,
    value: (value ?? '-') as ReactNode,
  }));

  const partitionRows: DiskPartitionInfo[] = Array.isArray(disk.partitions)
    ? disk.partitions
    : [];

  const columns: ColumnDef<DiskPartitionInfo>[] = [
    { id: 'name', header: 'نام پارتیشن', cell: (partition) => formatNullableString(partition.name) },
    {
      id: 'size',
      header: 'حجم',
      cell: (partition) => formatBytes(partition.size_bytes, { fallback: '-' }),
    },
    {
      id: 'mount',
      header: 'نقطه مونت',
      cell: (partition) => formatNullableString(partition.mount_point),
    },
    {
      id: 'filesystem',
      header: 'فایل‌سیستم',
      cell: (partition) => formatNullableString(partition.filesystem),
    },
    {
      id: 'options',
      header: 'گزینه‌ها',
      cell: (partition) => formatNullableString(partition.options?.join(', ')),
    },
  ];

  const usageRow: KeyValueRow = {
    label: 'درصد استفاده',
    value: formatPercent(disk.usage_percent),
  };

  return (
    <Box sx={{ backgroundColor: 'rgba(255,255,255,0.02)', p: 2.5 }}>
      <Card
        variant="outlined"
        sx={{
          borderColor: 'rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(16, 18, 20, 0.85)',
        }}
      >
        <CardContent>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1rem' }}>
                جزئیات دیسک {disk.disk}
              </Typography>
              <Typography sx={{ color: 'var(--color-secondary)' }}>
                ظرفیت: {formatBytes(disk.total_bytes, { fallback: '-' })}
              </Typography>
            </Box>

            <KeyValueCard title="مشخصات" rows={[usageRow, ...rows]} />

            {partitionRows.length > 0 ? (
              <>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                <ArrayTableSection title="پارتیشن‌ها" data={partitionRows} columns={columns} />
              </>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DiskInlineDetail;
