import {
  Box,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useMemo } from 'react';
import { BYTE_UNITS, clampPercent, parseNumeric } from '../constants/memory';
import { useMemory } from '../hooks/useMemory';
import { formatBytes } from '../utils/formatters';
import { createCardSx } from './cardStyles';
import AppPieChart from './charts/AppPieChart';

const Memory = () => {
  const { data, isLoading, error } = useMemory();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const chartSize = isSmallScreen ? 150 : 260;

  const percentFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    []
  );

  const formatBytesValue = (value: number | null | undefined) => {
    if (value == null) {
      return '—';
    }

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return '—';
    }

    return formatBytes(Math.max(numericValue, 0), {
      locale: 'en-US',
      maximumFractionDigits: 2,
      units: BYTE_UNITS,
      fallback: '—',
    });
  };

  const statsDividerColor =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.08)';

  const statsBackground =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.04)'
      : 'rgba(0, 0, 0, 0.03)';

  const usedArcColor = 'var(--color-primary)';
  const remainingArcColor =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.24)'
      : 'rgba(0, 0, 0, 0.12)';
  const fadedArcColor =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.08)';

  const cardSx = createCardSx(theme);

  if (isLoading) {
    return (
      <Box sx={{ ...cardSx, width: '100%' }}>
        <Skeleton
          variant="text"
          width="50%"
          height={28}
          sx={{ borderRadius: 1 }}
        />
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Skeleton
            variant="circular"
            width={chartSize}
            height={chartSize}
            sx={{ bgcolor: 'action.hover' }}
          />
        </Box>
        <Box
          sx={{
            width: '100%',
            bgcolor: statsBackground,
            borderRadius: 2,
            px: 2,
            py: 2,
            border: `1px solid ${statsDividerColor}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {Array.from({ length: 7 }).map((_, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                py: 0.75,
                borderBottom:
                  index === 6 ? 'none' : `1px dashed ${statsDividerColor}`,
              }}
            >
              <Skeleton
                variant="text"
                width="55%"
                height={18}
                sx={{ borderRadius: 1 }}
              />
              <Skeleton
                variant="text"
                width="25%"
                height={20}
                sx={{ borderRadius: 1 }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={cardSx}>
        <Typography variant="body2" sx={{ color: 'var(--color-error)' }}>
          خطا در دریافت داده‌های حافظه: {error.message}
        </Typography>
      </Box>
    );
  }

  const totalValue = parseNumeric(data?.total);
  const availableValue = parseNumeric(data?.available);
  const percentValue = parseNumeric(data?.percent);
  const usedValue = parseNumeric(data?.used);
  const freeValue = parseNumeric(data?.free);
  const buffersValue = parseNumeric(data?.buffers);
  const cachedValue = parseNumeric(data?.cached);

  const computedTotal =
    totalValue ??
    (usedValue != null && availableValue != null
      ? usedValue + availableValue
      : null);

  const computedUsed =
    usedValue ??
    (computedTotal != null && percentValue != null
      ? (computedTotal * percentValue) / 100
      : null);

  const fallbackRemainder =
    computedTotal != null && computedUsed != null
      ? computedTotal - computedUsed
      : null;

  const computedAvailable = availableValue ?? fallbackRemainder;
  const computedFree = freeValue ?? fallbackRemainder;

  const safeUsed =
    computedUsed != null && Number.isFinite(computedUsed)
      ? Math.max(computedUsed, 0)
      : 0;

  const safeAvailable =
    computedAvailable != null && Number.isFinite(computedAvailable)
      ? Math.max(computedAvailable, 0)
      : Math.max(fallbackRemainder ?? 0, 0);

  const safeFree =
    computedFree != null && Number.isFinite(computedFree)
      ? Math.max(computedFree, 0)
      : Math.max(fallbackRemainder ?? 0, 0);

  const safeTotal =
    computedTotal != null && Number.isFinite(computedTotal)
      ? Math.max(computedTotal, safeUsed + Math.max(fallbackRemainder ?? 0, 0))
      : safeUsed + Math.max(fallbackRemainder ?? 0, 0);

  const computedPercent =
    percentValue ??
    (computedUsed != null && computedTotal
      ? (computedUsed / computedTotal) * 100
      : null);

  const safePercent =
    computedPercent != null && Number.isFinite(computedPercent)
      ? clampPercent(computedPercent)
      : safeTotal > 0
        ? clampPercent((safeUsed / safeTotal) * 100)
        : null;

  const percentText =
    safePercent != null ? `${percentFormatter.format(safePercent)}٪` : '—';

  const hasMeaningfulData =
    safeTotal > 0 ||
    safeAvailable > 0 ||
    safeFree > 0 ||
    safeUsed > 0 ||
    (safePercent != null && safePercent > 0);

  const formatBytesForDisplay = (value: number | null | undefined) => {
    if (!hasMeaningfulData && (!value || value <= 0)) {
      return '—';
    }
    return formatBytesValue(value);
  };

  const percentDisplay = hasMeaningfulData ? percentText : '—';

  const chartRemaining = Math.max(
    safeAvailable,
    safeFree,
    safeTotal > safeUsed ? safeTotal - safeUsed : 0
  );

  const stats = [
    { key: 'total', label: 'کل', value: formatBytesForDisplay(safeTotal) },
    // {
    //   key: 'available',
    //   label: 'در دسترس',
    //   value: formatBytesForDisplay(safeAvailable),
    // },
    // { key: 'percent', label: 'درصد استفاده', value: percentDisplay },
    // {
    //   key: 'used',
    //   label: 'استفاده‌شده',
    //   value: formatBytesForDisplay(safeUsed),
    // },
    // { key: 'free', label: 'آزاد', value: formatBytesForDisplay(safeFree) },
    // {
    //   key: 'buffers',
    //   label: 'بافر',
    //   value: formatBytesForDisplay(buffersValue),
    // },
    // { key: 'cached', label: 'کش', value: formatBytesForDisplay(cachedValue) },
  ];

  return (
    <Box sx={{ ...cardSx, width: '100%' }}>
      <Typography
        variant="subtitle2"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontWeight: 600,
        }}
      >
        <Box component="span" sx={{ fontSize: 20 }}>
          💾
        </Box>
        وضعیت حافظه
      </Typography>

      {/*<Box*/}
      {/*  sx={{*/}
      {/*    textAlign: 'center',*/}
      {/*    display: 'flex',*/}
      {/*    flexDirection: 'column',*/}
      {/*    alignItems: 'center',*/}
      {/*    gap: 0.5,*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <Typography*/}
      {/*    variant="body2"*/}
      {/*    sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}*/}
      {/*  >*/}
      {/*    درصد استفاده در لحظه*/}
      {/*  </Typography>*/}
      {/*  <Typography*/}
      {/*    variant="h3"*/}
      {/*    sx={{*/}
      {/*      fontFamily: 'var(--font-vazir)',*/}
      {/*      fontWeight: 600,*/}
      {/*      color: 'var(--color-primary)',*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    {percentDisplay}*/}
      {/*  </Typography>*/}
      {/*</Box>*/}

      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <AppPieChart
          series={[
            {
              id: 'memory-usage',
              data: [
                {
                  id: 'used',
                  value: safeUsed,
                  label: 'استفاده‌شده',
                  color: usedArcColor,
                },
                {
                  id: 'remaining',
                  value: chartRemaining,
                  label: 'باقی‌مانده',
                  color: remainingArcColor,
                },
              ],
              outerRadius: 120,
              paddingAngle: 2,
              cornerRadius: 6,
              startAngle: 0,
              endAngle: 360,
              highlightScope: { fade: 'global', highlight: 'item' },
              faded: {
                innerRadius: 70,
                additionalRadius: -18,
                color: fadedArcColor,
              },
              valueFormatter: (item) => {
                if (item.id === 'used') {
                  const lines = [
                    `${formatBytesForDisplay(safeUsed)} : استفاده‌شده `,
                    `${formatBytesForDisplay(safeTotal)} : کل `,
                    `${formatBytesForDisplay(safeAvailable)} : در دسترس `,
                    `${formatBytesForDisplay(safeFree)} : آزاد `,
                    `${percentDisplay} : درصد استفاده `,
                    `${formatBytesForDisplay(cachedValue)} : کش `,
                    `${formatBytesForDisplay(buffersValue)} : بافر `,
                  ];
                  return lines.join('\n');
                }
                return `${formatBytesForDisplay(chartRemaining)}`;
              },
            },
          ]}
          width={chartSize}
          height={chartSize}
          margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
          hideLegend
          slotProps={{
            tooltip: {
              sx: {
                '& .MuiChartsTooltip-cell': {
                  whiteSpace: 'pre-line',
                },
                '& .MuiChartsTooltip-value': {
                  whiteSpace: 'pre-line',
                },
              },
            },
          }}
        />
      </Box>

      <Box
        sx={{
          width: '100%',
          bgcolor: statsBackground,
          borderRadius: '5px',
          px: 2,
          py: 2,
          border: `1px solid ${statsDividerColor}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {stats.map((stat, index) => (
          <Box
            key={stat.key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              py: 0.75,
              borderBottom:
                index === stats.length - 1
                  ? 'none'
                  : `1px dashed ${statsDividerColor}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: theme.palette.text.secondary }}
            >
              {stat.label}
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: 'var(--color-primary)' }}
            >
              {stat.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Memory;
