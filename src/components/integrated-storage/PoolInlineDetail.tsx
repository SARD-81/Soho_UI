import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  Chip,
} from '@mui/material';
import type { ZpoolCapacityEntry, ZpoolDetailEntry } from '../../@types/zpool';
import KeyValueCard, { type KeyValueRow } from '../common/KeyValueCard';
import ArrayTableSection, { type ColumnDef } from '../common/ArrayTableSection';
import formatDetailValue from '../../utils/formatDetailValue';
import { translateDetailKey } from '../../utils/detailLabels';
import PoolPropertyToggle from './PoolPropertyToggle';

type PoolDiskDetail = {
  disk_name?: string | null;
  status?: string | null;
  vdev_type?: string | null;
  full_path_name?: string | null;
  wwn?: string | null;
};

interface PoolInlineDetailProps {
  pool: ZpoolCapacityEntry;
  detail: ZpoolDetailEntry | null;
  isLoading: boolean;
  error: Error | null;
}

const INTERACTIVE_POOL_PROPERTIES = [
  'autoexpand',
  'autoreplace',
  'autotrim',
  'multihost',
];

const PoolInlineDetail = ({ pool, detail, isLoading, error }: PoolInlineDetailProps) => {
  if (isLoading) {
    return (
      <Box sx={{ p: 2.5, px: 3 }}>
        <Typography sx={{ color: 'var(--color-secondary)' }}>
          در حال دریافت جزئیات {pool.name}...
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

  if (!detail) {
    return (
      <Box sx={{ p: 2.5, px: 3 }}>
        <Typography sx={{ color: 'var(--color-secondary)' }}>
          اطلاعاتی برای نمایش وجود ندارد.
        </Typography>
      </Box>
    );
  }

  const resolveValue = (key: string): unknown => (detail as Record<string, unknown>)[key];

  const generalRows: KeyValueRow[] = [
    { label: translateDetailKey('name'), value: detail.name ?? pool.name },
    { label: translateDetailKey('size'), value: resolveValue('size') },
    { label: translateDetailKey('free'), value: resolveValue('free') },
    { label: translateDetailKey('alloc'), value: resolveValue('alloc') },
    { label: translateDetailKey('capacity'), value: resolveValue('capacity') },
    { label: translateDetailKey('health'), value: resolveValue('health') },
    { label: translateDetailKey('vdev_type'), value: resolveValue('vdev_type') },
    { label: translateDetailKey('fragmentation'), value: resolveValue('fragmentation') },
  ]
    .map((row) => ({ ...row, value: formatDetailValue(row.value) }))
    .filter((row) => row.value !== '-' && row.value !== undefined && row.value !== null);

  const settingsRows: KeyValueRow[] = [
    ...INTERACTIVE_POOL_PROPERTIES.map((propertyKey) => ({
      label: translateDetailKey(propertyKey),
      value: (
        <PoolPropertyToggle
          poolName={pool.name}
          propertyKey={propertyKey}
          value={resolveValue(propertyKey)}
        />
      ),
    })),
    {
      label: translateDetailKey('failmode'),
      value: formatDetailValue(resolveValue('failmode')),
    },
  ];

  const identifiers: KeyValueRow[] = [
    { label: translateDetailKey('guid'), value: formatDetailValue(resolveValue('guid')) },
    {
      label: translateDetailKey('load_guid'),
      value: formatDetailValue(resolveValue('load_guid')),
    },
  ].filter((row) => row.value !== '-' && row.value !== undefined && row.value !== null);

  const diskData = Array.isArray((detail as Record<string, unknown>).disks)
    ? ((detail as Record<string, unknown>).disks as PoolDiskDetail[])
    : [];

  const diskColumns: ColumnDef<PoolDiskDetail>[] = [
    { id: 'name', header: 'نام دیسک', cell: (disk) => disk.disk_name ?? '-' },
    {
      id: 'status',
      header: 'وضعیت',
      cell: (disk) => {
        const status = (disk.status ?? '-').toString();
        const color = status.toLowerCase() === 'online' ? 'success' : 'warning';
        return (
          <Chip
            label={status}
            color={color as 'success' | 'warning'}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    { id: 'vdev', header: 'نوع VDEV', cell: (disk) => disk.vdev_type ?? '-' },
    { id: 'path', header: 'مسیر دستگاه', cell: (disk) => disk.full_path_name ?? '-' },
    { id: 'wwn', header: 'WWN', cell: (disk) => disk.wwn ?? '-' },
  ];

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
                جزئیات {pool.name}
              </Typography>
              <Typography sx={{ color: 'var(--color-secondary)' }}>
                سلامت: {formatDetailValue(resolveValue('health'))}
              </Typography>
            </Box>

            {generalRows.length > 0 ? (
              <KeyValueCard title="مشخصات کلی" rows={generalRows} />
            ) : null}

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

            <KeyValueCard title="تنظیمات" rows={settingsRows} />

            {identifiers.length > 0 ? (
              <KeyValueCard title="شناسه‌ها" rows={identifiers} />
            ) : null}

            {diskData.length > 0 ? (
              <ArrayTableSection title="دیسک‌ها" data={diskData} columns={diskColumns} />
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PoolInlineDetail;
