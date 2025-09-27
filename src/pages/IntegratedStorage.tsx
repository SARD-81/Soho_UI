import {
  Alert,
  Box,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMemo } from 'react';
import { diskPercentFormatter } from '../constants/disk';
import { createCardSx } from '../components/cardStyles';
import { useZpool } from '../hooks/useZpool';
import { formatBytes } from '../utils/formatters';

const formatPercent = (value: number | null | undefined) =>
  value != null && Number.isFinite(value)
    ? `${diskPercentFormatter.format(value)}٪`
    : 'ـ';

const formatBytesValue = (value: number | null | undefined) =>
  value != null && Number.isFinite(value) ? formatBytes(value) : 'ـ';

const getHealthChipStyles = (themeMode: 'light' | 'dark', health?: string) => {
  if (!health) {
    return {
      label: 'نامشخص',
      sx: {
        bgcolor:
          themeMode === 'dark'
            ? alpha('#ffffff', 0.08)
            : alpha('#000000', 0.08),
        color: themeMode === 'dark' ? '#f3f3f3' : '#1f1f1f',
      },
    };
  }

  const normalized = health.toLowerCase();

  if (normalized.includes('online') || normalized.includes('healthy')) {
    return {
      label: health,
      sx: {
        bgcolor: alpha('#00c6a9', 0.16),
        color: '#00c6a9',
      },
    };
  }

  if (normalized.includes('degraded') || normalized.includes('warning')) {
    return {
      label: health,
      sx: {
        bgcolor: alpha('#a3924b', 0.18),
        color: '#a3924b',
      },
    };
  }

  if (normalized.includes('faulted') || normalized.includes('offline')) {
    return {
      label: health,
      sx: {
        bgcolor: alpha('#ef4444', 0.18),
        color: '#ef4444',
      },
    };
  }

  return {
    label: health,
    sx: {
      bgcolor:
        themeMode === 'dark'
          ? alpha('#ffffff', 0.1)
          : alpha('#000000', 0.1),
      color: themeMode === 'dark' ? '#f3f3f3' : '#1f1f1f',
    },
  };
};

const IntegratedStorage = () => {
  const theme = useTheme();
  const {
    data: zpoolData,
    isLoading,
    isFetching,
    error,
  } = useZpool({ refetchInterval: 15000 });

  const pools = useMemo(() => zpoolData?.pools ?? [], [zpoolData]);
  const failedPools = useMemo(
    () => zpoolData?.failedPools ?? [],
    [zpoolData]
  );
  const showSkeletonRows = isLoading || (isFetching && pools.length === 0);

  const tableCardSx = useMemo(
    () => ({
      ...createCardSx(theme),
      p: 0,
      gap: 0,
      overflow: 'hidden',
    }),
    [theme]
  );

  const borderColor =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.08)';

  const zebraColor = alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.06);
  const hoverColor = alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.12);
  const headerBackground = `linear-gradient(135deg, ${alpha(
    theme.palette.primary.main,
    theme.palette.mode === 'dark' ? 0.18 : 0.24
  )}, ${alpha(theme.palette.primary.light, theme.palette.mode === 'dark' ? 0.2 : 0.28)})`;

  const columns = useMemo(
    () => [
      { key: 'name', label: 'نام استخر', align: 'right' as const },
      { key: 'total', label: 'کل', align: 'center' as const },
      { key: 'used', label: 'استفاده‌شده', align: 'center' as const },
      { key: 'free', label: 'فضای آزاد', align: 'center' as const },
      { key: 'capacity', label: 'درصد استفاده', align: 'center' as const },
      { key: 'dedup', label: 'نرخ Dedup', align: 'center' as const },
      { key: 'fragmentation', label: 'درصد Fragmentation', align: 'center' as const },
      { key: 'health', label: 'سلامت', align: 'center' as const },
    ],
    []
  );

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        fontFamily: 'var(--font-vazir)',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box component="span" sx={{ fontSize: 24 }}>📦</Box>
        <Typography variant="h5" sx={{ color: 'var(--color-primary)', fontWeight: 700 }}>
          فضای یکپارچه
        </Typography>
      </Stack>

      <TableContainer component={Box} sx={tableCardSx}>
        <Box
          sx={{
            px: { xs: 2.5, md: 3 },
            py: { xs: 2, md: 2.5 },
            background: headerBackground,
            color: theme.palette.mode === 'dark' ? '#f9f9f9' : '#0d0d0d',
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              نمای کلی مخازن ZFS
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              وضعیت و ظرفیت استخرهای ذخیره‌سازی یکپارچه را با جزئیات کامل مشاهده کنید.
            </Typography>
          </Stack>
        </Box>

        {error && (
          <Box sx={{ px: { xs: 2.5, md: 3 }, py: 2 }}>
            <Alert severity="error" variant="outlined" sx={{ direction: 'rtl' }}>
              خطا در دریافت اطلاعات استخرها: {error.message}
            </Alert>
          </Box>
        )}

        {failedPools.length > 0 && !error && (
          <Box sx={{ px: { xs: 2.5, md: 3 }, py: 2 }}>
            <Alert severity="warning" variant="outlined" sx={{ direction: 'rtl' }}>
              بازیابی اطلاعات برای استخرهای زیر با خطا مواجه شد: {failedPools.join('، ')}
            </Alert>
          </Box>
        )}

        <Divider sx={{ borderColor, mx: { xs: 2.5, md: 3 } }} />

        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow
                sx={{
                  '& th': {
                    borderBottom: `1px solid ${borderColor}`,
                    color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1f2937',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    py: 1.75,
                  },
                }}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align}>
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {showSkeletonRows
                ? Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      {columns.map((column) => (
                        <TableCell
                          key={column.key}
                          align={column.align}
                          sx={{ borderBottom: `1px solid ${borderColor}`, py: 1.5 }}
                        >
                          <Skeleton
                            variant="text"
                            sx={{ mx: column.align === 'center' ? 'auto' : 0, width: column.key === 'name' ? '70%' : '60%' }}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : pools.length > 0
                  ? pools.map((pool) => {
                      const healthChip = getHealthChipStyles(theme.palette.mode, pool.health);
                      return (
                        <TableRow
                          key={pool.name}
                          hover
                          sx={{
                            '&:nth-of-type(odd)': {
                              backgroundColor: zebraColor,
                            },
                            transition: 'background-color 0.3s ease',
                            '&:hover': {
                              backgroundColor: hoverColor,
                            },
                            '& td': {
                              borderBottom: `1px solid ${borderColor}`,
                              color: theme.palette.text.secondary,
                              fontSize: '0.95rem',
                              fontWeight: 500,
                              py: 1.75,
                            },
                            '&:last-of-type td': {
                              borderBottom: 'none',
                            },
                          }}
                        >
                          <TableCell align="right" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                            {pool.name}
                          </TableCell>
                          <TableCell align="center">{formatBytesValue(pool.totalBytes)}</TableCell>
                          <TableCell align="center">{formatBytesValue(pool.usedBytes)}</TableCell>
                          <TableCell align="center">{formatBytesValue(pool.freeBytes)}</TableCell>
                          <TableCell align="center">{formatPercent(pool.capacityPercent)}</TableCell>
                          <TableCell align="center">
                            {pool.deduplication ??
                              (pool.deduplicationRatio != null
                                ? `${pool.deduplicationRatio.toFixed(2)}x`
                                : 'ـ')}
                          </TableCell>
                          <TableCell align="center">{formatPercent(pool.fragmentationPercent)}</TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={healthChip.label}
                              sx={{
                                fontWeight: 600,
                                px: 1,
                                borderRadius: 1.5,
                                ...healthChip.sx,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  : (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          استخر فعالی برای نمایش وجود ندارد.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>
        </Box>
      </TableContainer>
    </Box>
  );
};

export default IntegratedStorage;
