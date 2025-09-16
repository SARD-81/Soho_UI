import { Box, Typography, useTheme } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { useMemo } from 'react';
import { useMemory } from '../hooks/useMemory';

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const parseNumeric = (value: unknown): number | null => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const Memory = () => {
  const { data, isLoading, error } = useMemory();
  const theme = useTheme();

  const percentFormatter = useMemo(
    () =>
      new Intl.NumberFormat('fa-IR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    []
  );

  const byteFormatter = useMemo(
    () =>
      new Intl.NumberFormat('fa-IR', {
        maximumFractionDigits: 2,
      }),
    []
  );

  const formatBytesValue = (value: number | null | undefined) => {
    if (value == null || !Number.isFinite(value)) {
      return '—';
    }

    const absoluteValue = Math.max(value, 0);
    let unitIndex = 0;
    let normalizedValue = absoluteValue;

    while (normalizedValue >= 1024 && unitIndex < BYTE_UNITS.length - 1) {
      normalizedValue /= 1024;
      unitIndex += 1;
    }

    return `${byteFormatter.format(normalizedValue)} ${BYTE_UNITS[unitIndex]}`;
  };

  const containerBorderColor =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(0, 0, 0, 0.08)';

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

  const cardSx = {
    p: 3,
    bgcolor: 'var(--color-card-bg)',
    borderRadius: 3,
    mb: 3,
    color: 'var(--color-bg-primary)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 3,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.18)',
    border: `1px solid ${containerBorderColor}`,
    backdropFilter: 'blur(14px)',
  };

  if (isLoading) {
    return (
      <Box sx={cardSx}>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          در حال بارگذاری اطلاعات حافظه...
        </Typography>
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
    {
      key: 'available',
      label: 'در دسترس',
      value: formatBytesForDisplay(safeAvailable),
    },
    { key: 'percent', label: 'درصد استفاده', value: percentDisplay },
    { key: 'used', label: 'استفاده‌شده', value: formatBytesForDisplay(safeUsed) },
    { key: 'free', label: 'آزاد', value: formatBytesForDisplay(safeFree) },
  ];

  return (
    <Box sx={cardSx}>
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

      <Box
        sx={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
        >
          درصد استفاده در لحظه
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontFamily: 'var(--font-didot)',
            fontWeight: 600,
            color: 'var(--color-primary)',
          }}
        >
          {percentDisplay}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          به‌روزرسانی هر ۳ ثانیه
        </Typography>
      </Box>

      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <PieChart
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
              innerRadius: 70,
              outerRadius: 120,
              paddingAngle: 2,
              cornerRadius: 6,
              startAngle: -90,
              endAngle: 270,
              highlightScope: { fade: 'global', highlight: 'item' },
              faded: { innerRadius: 70, additionalRadius: -18, color: fadedArcColor },
              valueFormatter: (item) => {
                if (item.id === 'used') {
                  const lines = [
                    `استفاده‌شده: ${formatBytesForDisplay(safeUsed)}`,
                    `کل: ${formatBytesForDisplay(safeTotal)}`,
                    `در دسترس: ${formatBytesForDisplay(safeAvailable)}`,
                    `آزاد: ${formatBytesForDisplay(safeFree)}`,
                    `درصد استفاده: ${percentDisplay}`,
                  ];
                  return lines.join('\n');
                }
                return `${item.label ?? 'باقی‌مانده'}: ${formatBytesForDisplay(chartRemaining)}`;
              },
            },
          ]}
          width={260}
          height={260}
          margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
          hideLegend
          slotProps={{
            tooltip: {
              sx: {
                direction: 'rtl',
                '& .MuiChartsTooltip-table': {
                  direction: 'rtl',
                },
                '& .MuiChartsTooltip-cell': {
                  whiteSpace: 'pre-line',
                  fontFamily: 'var(--font-vazir)',
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
          borderRadius: 2,
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
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
              {stat.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Memory;
