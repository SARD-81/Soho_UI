import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useMemo } from 'react';
import { MdDeleteOutline, MdEdit } from 'react-icons/md';
import type { ZpoolCapacityEntry } from '../@types/zpool';
import { diskPercentFormatter } from '../constants/disk';
import { useZpool } from '../hooks/useZpool';
import { formatBytes } from '../utils/formatters';

const STATUS_STYLES: Record<
  'active' | 'warning' | 'maintenance' | 'unknown',
  { bg: string; color: string; label: string }
> = {
  active: {
    bg: 'rgba(0, 198, 169, 0.18)',
    color: 'var(--color-primary)',
    label: 'فعال',
  },
  warning: {
    bg: 'rgba(227, 160, 8, 0.18)',
    color: '#e3a008',
    label: 'نیاز به بررسی',
  },
  maintenance: {
    bg: 'rgba(35, 167, 213, 0.18)',
    color: 'var(--color-primary-light)',
    label: 'در حال ارتقاء',
  },
  unknown: {
    bg: 'rgba(120, 120, 120, 0.18)',
    color: 'var(--color-secondary)',
    label: 'نامشخص',
  },
};

const clampPercent = (value: number | null | undefined) => {
  if (value == null || !Number.isFinite(value)) {
    return null;
  }

  if (value < 0) {
    return 0;
  }

  if (value > 100) {
    return 100;
  }

  return value;
};

const resolveStatus = (health?: string) => {
  if (!health) {
    return { key: 'unknown' as const, label: STATUS_STYLES.unknown.label };
  }

  const normalized = health.toLowerCase();

  if (normalized.includes('online') || normalized.includes('healthy')) {
    return { key: 'active' as const, label: STATUS_STYLES.active.label };
  }

  if (
    normalized.includes('degraded') ||
    normalized.includes('fault') ||
    normalized.includes('offline') ||
    normalized.includes('error')
  ) {
    return { key: 'warning' as const, label: STATUS_STYLES.warning.label };
  }

  if (
    normalized.includes('resilver') ||
    normalized.includes('rebuild') ||
    normalized.includes('replace') ||
    normalized.includes('sync')
  ) {
    return {
      key: 'maintenance' as const,
      label: STATUS_STYLES.maintenance.label,
    };
  }

  return { key: 'unknown' as const, label: health };
};

const formatCapacity = (value: number | null | undefined) =>
  formatBytes(value, {
    locale: 'fa-IR',
    maximumFractionDigits: 1,
    fallback: '-',
  });

const formatPercent = (value: number | null | undefined) => {
  if (value == null || !Number.isFinite(value)) {
    return '-';
  }

  return `${diskPercentFormatter.format(value)}٪`;
};

const getDedupLabel = (pool: ZpoolCapacityEntry) => {
  if (pool.deduplication) {
    return pool.deduplication;
  }

  if (
    pool.deduplicationRatio != null &&
    Number.isFinite(pool.deduplicationRatio)
  ) {
    return `${pool.deduplicationRatio.toFixed(2)}x`;
  }

  return '-';
};

const IntegratedStorage = () => {
  const { data, isLoading, error } = useZpool({ refetchInterval: 15000 });

  const pools = useMemo(() => data?.pools ?? [], [data?.pools]);

  const handleEdit = useCallback((pool: ZpoolCapacityEntry) => {
    if (typeof window !== 'undefined') {
      window.alert(`ویرایش استخر ${pool.name}`);
    }
  }, []);

  const handleDelete = useCallback((pool: ZpoolCapacityEntry) => {
    if (typeof window !== 'undefined') {
      window.alert(`حذف استخر ${pool.name}`);
    }
  }, []);

  return (
    <Box sx={{ p: 3, fontFamily: 'var(--font-vazir)' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography
          variant="h5"
          sx={{ color: 'var(--color-primary)', fontWeight: 700 }}
        >
          فضای یکپارچه
        </Typography>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          mt: 4,
          borderRadius: 3,
          backgroundColor: 'var(--color-card-bg)',
          border: '1px solid var(--color-input-border)',
          boxShadow: '0 18px 40px -24px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
        }}
      >
        <Table sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow
              sx={{
                background:
                  'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))',
                '& .MuiTableCell-root': {
                  color: 'var(--color-bg)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderBottom: 'none',
                },
              }}
            >
              <TableCell align="left">نام Pool</TableCell>
              <TableCell align="left">ظرفیت کل</TableCell>
              <TableCell align="center">حجم مصرف‌شده</TableCell>
              <TableCell align="right">حجم آزاد</TableCell>
              <TableCell align="center">وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      alignItems: 'center',
                    }}
                  >
                    <CircularProgress color="primary" size={32} />
                    <Typography sx={{ color: 'var(--color-secondary)' }}>
                      در حال دریافت اطلاعات استخرها...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {error && !isLoading && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ color: 'var(--color-error)' }}>
                    خطا در دریافت اطلاعات استخرها: {error.message}
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !error && pools.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ color: 'var(--color-secondary)' }}>
                    هیچ استخر فعالی برای نمایش وجود ندارد.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {pools.map((pool) => {
              const utilization = clampPercent(pool.capacityPercent);
              const status = resolveStatus(pool.health);
              const statusStyle = STATUS_STYLES[status.key];

              return (
                <TableRow
                  key={pool.name}
                  sx={{
                    '&:last-of-type .MuiTableCell-root': {
                      borderBottom: 'none',
                    },
                    '& .MuiTableCell-root': {
                      borderBottom: '1px solid var(--color-input-border)',
                      fontSize: '0.92rem',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(0, 198, 169, 0.08)',
                    },
                  }}
                >
                  <TableCell align="left">
                    <Typography
                      sx={{ fontWeight: 700, color: 'var(--color-text)' }}
                    >
                      {pool.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'var(--color-secondary)' }}
                    >
                      وضعیت گزارش‌شده: {pool.health ?? 'نامشخص'}
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography
                      sx={{ fontWeight: 600, color: 'var(--color-text)' }}
                    >
                      {formatCapacity(pool.totalBytes)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 180 }}>
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                    >
                      <LinearProgress
                        variant="determinate"
                        value={utilization ?? 0}
                        sx={{
                          height: 8,
                          borderRadius: 999,
                          backgroundColor: 'rgba(0, 198, 169, 0.12)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 999,
                            backgroundColor: 'var(--color-primary)',
                          },
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: 'var(--color-text)' }}
                      >
                        {formatCapacity(pool.usedBytes)}
                        <Typography
                          component="span"
                          sx={{ mx: 0.5, color: 'var(--color-secondary)' }}
                        >
                          از
                        </Typography>
                        {formatCapacity(pool.totalBytes)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ color: 'var(--color-text)' }}>
                      {formatCapacity(pool.freeBytes)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={status.label}
                      sx={{
                        px: 1.5,
                        fontWeight: 600,
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        borderRadius: 2,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}
                    >
                      <Tooltip title="ویرایش">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(pool)}
                        >
                          <MdEdit size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="حذف">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(pool)}
                        >
                          <MdDeleteOutline size={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default IntegratedStorage;
