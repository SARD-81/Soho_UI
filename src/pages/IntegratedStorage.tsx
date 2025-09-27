import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import {
  MdCheckCircle,
  MdDelete,
  MdEdit,
  MdError,
  MdHelpOutline,
  MdWarningAmber,
} from 'react-icons/md';
import type { RgbColor } from '../@types/cpu';
import { useZpool } from '../hooks/useZpool';
import { formatBytes } from '../utils/formatters';

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const START_COLOR: RgbColor = { r: 0, g: 255, b: 0 };
const ALERT_COLOR: RgbColor = { r: 255, g: 0, b: 0 };

const interpolateColor = (start: RgbColor, end: RgbColor, ratio: number) => ({
  r: Math.round(start.r + (end.r - start.r) * ratio),
  g: Math.round(start.g + (end.g - start.g) * ratio),
  b: Math.round(start.b + (end.b - start.b) * ratio),
});

const formatRgb = ({ r, g, b }: RgbColor) => `rgb(${r}, ${g}, ${b})`;

const getUsageColor = (percent: number) => {
  const ratio = clampPercent(percent) / 100;
  return formatRgb(interpolateColor(START_COLOR, ALERT_COLOR, ratio));
};

const getHealthPresentation = (health?: string) => {
  if (!health) {
    return {
      icon: <MdHelpOutline size={22} />,
      color: 'text.disabled',
      tooltip: 'وضعیت سلامت نامشخص است',
    };
  }

  const normalized = health.trim().toLowerCase();

  if (['online', 'healthy', 'active', 'ok', 'up'].includes(normalized)) {
    return {
      icon: <MdCheckCircle size={22} />,
      color: 'success.main',
      tooltip: `وضعیت سلامت: ${health}`,
    };
  }

  if (
    ['degraded', 'warning', 'recovering', 'resilvering', 'unknown'].includes(
      normalized
    )
  ) {
    return {
      icon: <MdWarningAmber size={22} />,
      color: 'warning.main',
      tooltip: `وضعیت سلامت: ${health}`,
    };
  }

  return {
    icon: <MdError size={22} />,
    color: 'error.main',
    tooltip: `وضعیت سلامت: ${health}`,
  };
};

const UsageBar = ({
  usedBytes,
  totalBytes,
  capacityPercent,
}: {
  usedBytes: number | null;
  totalBytes: number | null;
  capacityPercent: number | null;
}) => {
  const effectivePercent = useMemo(() => {
    if (totalBytes && usedBytes != null && totalBytes > 0) {
      return clampPercent((usedBytes / totalBytes) * 100);
    }

    if (capacityPercent != null) {
      return clampPercent(capacityPercent);
    }

    return null;
  }, [capacityPercent, totalBytes, usedBytes]);

  if (effectivePercent == null) {
    return (
      <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
        —
      </Box>
    );
  }

  const usageColor = getUsageColor(effectivePercent);
  const usedText = formatBytes(usedBytes, { fallback: '—' });

  return (
    <Box
      sx={{
        position: 'relative',
        height: 32,
        borderRadius: 999,
        bgcolor: 'action.hover',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        px: 1.5,
        minWidth: 220,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          width: `${effectivePercent}%`,
          bgcolor: usageColor,
          transition: 'width 0.4s ease',
        }}
      />
      <Typography
        component="span"
        sx={{
          position: 'relative',
          color: 'common.white',
          fontSize: '0.875rem',
          fontWeight: 600,
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        }}
      >
        {usedText} ({Math.round(effectivePercent)}٪)
      </Typography>
    </Box>
  );
};

const IntegratedStorage = () => {
  const { data, isLoading, isFetching, error } = useZpool({
    refetchInterval: 15000,
  });

  const pools = data?.pools ?? [];
  const failedPools = data?.failedPools ?? [];

  return (
    <Box
      sx={{
        p: 3,
        fontFamily: 'var(--font-vazir)',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <Typography variant="h5" sx={{ color: 'var(--color-primary)' }}>
          فضای یکپارچه
        </Typography>
        {isFetching && !isLoading && <CircularProgress size={20} />}
      </Stack>

      {error && (
        <Alert severity="error" variant="outlined" sx={{ direction: 'rtl' }}>
          خطا در دریافت اطلاعات استخرها: {error.message}
        </Alert>
      )}

      {failedPools.length > 0 && (
        <Alert severity="warning" variant="outlined" sx={{ direction: 'rtl' }}>
          بازیابی اطلاعات برای استخرهای زیر با خطا مواجه شد: {failedPools.join('، ')}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table sx={{ minWidth: 650 }} aria-label="جدول فضاهای ذخیره‌سازی">
          <TableHead>
            <TableRow>
              <TableCell align="right">نام استخر</TableCell>
              <TableCell align="right">حجم کل</TableCell>
              <TableCell align="right">حجم استفاده شده</TableCell>
              <TableCell align="center">سلامت</TableCell>
              <TableCell align="center">اقدامات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton variant="text" width="60%" height={24} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="50%" height={24} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rectangular" height={32} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton variant="circular" width={28} height={28} />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="circular" width={32} height={32} />
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && pools.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    هیچ استخری برای نمایش وجود ندارد.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {pools.map((pool) => {
              const healthPresentation = getHealthPresentation(pool.health);

              return (
                <TableRow key={pool.name} hover>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                    {pool.name}
                  </TableCell>
                  <TableCell>{formatBytes(pool.totalBytes, { fallback: '—' })}</TableCell>
                  <TableCell>
                    <UsageBar
                      usedBytes={pool.usedBytes}
                      totalBytes={pool.totalBytes}
                      capacityPercent={pool.capacityPercent}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={healthPresentation.tooltip} placement="top">
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: healthPresentation.color,
                        }}
                      >
                        {healthPresentation.icon}
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="ویرایش" placement="top">
                        <IconButton
                          color="primary"
                          size="small"
                          aria-label={`ویرایش استخر ${pool.name}`}
                        >
                          <MdEdit size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="حذف" placement="top">
                        <IconButton
                          color="error"
                          size="small"
                          aria-label={`حذف استخر ${pool.name}`}
                        >
                          <MdDelete size={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
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
