import {
  Box,
  Divider,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';
import { RadarChart, type RadarSeries } from '@mui/x-charts/RadarChart';

import { PieChart } from '@mui/x-charts/PieChart';
import { Fragment, useMemo } from 'react';
import type { DiskIOStats } from '../@types/disk';
import { useDisk } from '../hooks/useDisk';
import '../index.css';

const BYTES_IN_GB = 1024 ** 3;
const METRIC_KEYS: Array<keyof DiskIOStats> = [
  'read_count',
  'write_count',
  'read_bytes',
  'write_bytes',
  'read_time',
  'write_time',
  'read_merged_count',
  'write_merged_count',
  'busy_time',
];

type DiskMetricConfig = {
  key: keyof DiskIOStats;
  label: string;
  getValue: (metrics: NormalizedMetrics) => number;
  format: (value: number) => string;
};

const IO_METRICS: DiskMetricConfig[] = [
  {
    key: 'read_count',
    label: 'تعداد خواندن',
    getValue: (metrics) => metrics.read_count,
    format: (value) => `${formatLargeNumber(Math.max(value, 0))} عملیات`,
  },
  {
    key: 'write_count',
    label: 'تعداد نوشتن',
    getValue: (metrics) => metrics.write_count,
    format: (value) => `${formatLargeNumber(Math.max(value, 0))} عملیات`,
  },
  {
    key: 'read_bytes',
    label: 'حجم خوانده‌شده',
    getValue: (metrics) => metrics.read_bytes,
    format: (value) => formatBytes(Math.max(value, 0)),
  },
  {
    key: 'write_bytes',
    label: 'حجم نوشته‌شده',
    getValue: (metrics) => metrics.write_bytes,
    format: (value) => formatBytes(Math.max(value, 0)),
  },
  {
    key: 'busy_time',
    label: 'زمان مشغولی (ms)',
    getValue: (metrics) => metrics.busy_time,
    format: (value) => `${formatLargeNumber(Math.max(value, 0))} ms`,
  },
];

const formatBytes = (value: number) => {
  if (!Number.isFinite(value)) {
    return '-';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let currentValue = value;
  let unitIndex = 0;

  while (currentValue >= 1024 && unitIndex < units.length - 1) {
    currentValue /= 1024;
    unitIndex += 1;
  }

  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: currentValue >= 100 ? 0 : 1,
  });

  return `${formatter.format(currentValue)} ${units[unitIndex]}`;
};

const persianNumberFormatter = new Intl.NumberFormat('fa-IR');

const percentFormatter = new Intl.NumberFormat('fa-IR', {
  maximumFractionDigits: 0,
});

const formatMetricValue = (metricKey: keyof DiskIOStats, value: number) => {
  if (!Number.isFinite(value)) {
    return '-';
  }

  if (metricKey === 'read_bytes' || metricKey === 'write_bytes') {
    return formatBytes(value);
  }

  if (metricKey === 'busy_time') {
    if (Math.abs(value) >= 1000) {
      const seconds = value / 1000;
      const secondsFormatter = new Intl.NumberFormat('fa-IR', {
        maximumFractionDigits: Math.abs(seconds) >= 100 ? 0 : 1,
      });
      return `${secondsFormatter.format(seconds)} ثانیه`;
    }
    return `${persianNumberFormatter.format(value)} میلی‌ثانیه`;
  }

  return persianNumberFormatter.format(value);
};

const normalizeMetrics = (metrics?: Partial<DiskIOStats>) => {
  return METRIC_KEYS.reduce(
    (acc, key) => {
      acc[key] = Number(metrics?.[key] ?? 0);
      return acc;
    },
    {} as Record<keyof DiskIOStats, number>
  );
};

type NormalizedMetrics = ReturnType<typeof normalizeMetrics>;

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const safeNumber = (value: unknown) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const diskPercentFormatter = new Intl.NumberFormat('fa-IR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const createCardSx = (theme: Theme) => {
  const cardBorderColor =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(0, 0, 0, 0.08)';

  return {
    p: 3,
    bgcolor: 'var(--color-card-bg)',
    borderRadius: 3,
    mb: 3,
    color: 'var(--color-bg-primary)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 3,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.18)',
    border: `1px solid ${cardBorderColor}`,
    backdropFilter: 'blur(14px)',
    height: '100%',
  } as const;
};

interface DeviceMetricsEntry {

  name: string;
  metrics: NormalizedMetrics;
}

interface MetricExtent {
  min: number;
  max: number;
}

const durationFormatter = new Intl.NumberFormat('fa-IR', {
  maximumFractionDigits: 1,
});

const normalizedPercentFormatter = new Intl.NumberFormat('fa-IR', {
  maximumFractionDigits: 0,
});

const normalizeMetricValue = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) {
    return 0;
  }

  if (max === min) {
    if (max === 0) {
      return 0;
    }

    return 100;
  }

  const ratio = (value - min) / (max - min);
  const bounded = Math.max(0, Math.min(1, ratio));
  return bounded * 100;
};

const computeMetricExtents = (
  devices: DeviceMetricsEntry[],
  metrics: typeof PARALLEL_METRICS
): MetricExtent[] => {
  return metrics.map((metric) => {
    const values = devices
      .map((item) => Number(item.metrics[metric.key] ?? 0))
      .filter((value) => Number.isFinite(value));

    if (values.length === 0) {
      return { min: 0, max: 0 };
    }

    return {
      min: Math.min(...values),
      max: Math.max(...values),
    } satisfies MetricExtent;
  });
};

const formatNormalizedPercent = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0٪';
  }

  const clamped = Math.max(0, Math.min(100, value));
  return `${normalizedPercentFormatter.format(clamped)}٪`;
};

const formatMetricValue = (metricKey: keyof DiskIOStats, rawValue: number) => {
  if (!Number.isFinite(rawValue)) {
    return '-';
  }

  if (metricKey === 'read_bytes' || metricKey === 'write_bytes') {
    return formatBytes(rawValue);
  }

  if (
    metricKey === 'read_time' ||
    metricKey === 'write_time' ||
    metricKey === 'busy_time'
  ) {
    return `${durationFormatter.format(rawValue)} ms`;
  }

  return formatLargeNumber(rawValue);
};

interface DeviceMetricsRadarChartProps {
  devices: DeviceMetricsEntry[];

  metrics: typeof PARALLEL_METRICS;
  metricExtents: MetricExtent[];
  colors: string[];
  height?: number;
}

const DeviceMetricsRadarChart = ({
  devices,
  metrics,
  metricExtents,
  colors,
  height = 360,
}: DeviceMetricsRadarChartProps) => {
  const theme = useTheme();

  const radarMetrics = useMemo(
    () =>
      metrics.map((metric) => ({
        name: metric.label,
        min: 0,
        max: 100,
      })),
    [metrics]
  );

  const series = useMemo<RadarSeries[]>(
    () =>
      devices.map((device, index) => {
        const normalizedValues = metrics.map((metric, metricIndex) => {
          const { min, max } = metricExtents[metricIndex] ?? { min: 0, max: 0 };
          const rawValue = Number(device.metrics[metric.key] ?? 0);
          return normalizeMetricValue(rawValue, min, max);
        });

        return {
          id: device.name,
          label: device.name,
          color: colors[index % colors.length],
          data: normalizedValues,
          fillArea: true,
          valueFormatter: (_value, { dataIndex }) => {
            const activeIndex = dataIndex ?? 0;

            return metrics
              .map((metric, idx) => {
                const rawValue = Number(device.metrics[metric.key] ?? 0);
                const normalizedDisplay = normalizedValues[idx] ?? 0;
                const prefix = idx === activeIndex ? '➤ ' : '  ';

                return `${prefix}${metric.label}: ${formatMetricValue(
                  metric.key,
                  rawValue
                )} (${formatNormalizedPercent(normalizedDisplay)} نسبی)`;
              })
              .join('\n');
          },
        } satisfies RadarSeries;
      }),
    [colors, devices, metricExtents, metrics]
  );

  if (devices.length === 0 || series.length === 0) {
    return null;
  }

  const dividerColor = theme.palette.divider;

  return (
    <Box sx={{ width: '100%', overflowX: 'auto', direction: 'ltr' }}>
      <RadarChart
        height={height}
        series={series}
        radar={{
          metrics: radarMetrics,
          max: 100,
          labelGap: 8,
        }}
        slotProps={{
          legend: {
            direction: 'row',
            position: { vertical: 'bottom', horizontal: 'center' },
          },
          tooltip: {
            sx: {
              direction: 'rtl',
              '& .MuiTypography-root': {
                whiteSpace: 'pre-line',
              },
            },
          },
        }}
        sx={{
          minWidth: 520,
          '& .MuiChartsAxis-line': {
            stroke: dividerColor,
          },
        }}
      />
    </Box>
  );
};

interface DeviceMetricsGroupedBarChartProps {
  devices: DeviceMetricsEntry[];
  metrics: typeof PARALLEL_METRICS;
  metricExtents: MetricExtent[];
  colors: string[];
  height?: number;
}

const DeviceMetricsGroupedBarChart = ({
  devices,
  metrics,
  metricExtents,
  colors,
  height = 320,
}: DeviceMetricsGroupedBarChartProps) => {
  const dataset = useMemo(() => {
    return metrics.map((metric) => {
      const row: Record<string, number | string> = {
        metricKey: metric.key,
        metricLabel: metric.label,
      };

      devices.forEach((device, deviceIndex) => {
        row[`device-${deviceIndex}`] = Number(device.metrics[metric.key] ?? 0);
      });

      return row;
    });
  }, [devices, metrics]);

  const series = useMemo(
    () =>
      devices.map((device, deviceIndex) => ({
        dataKey: `device-${deviceIndex}`,
        label: device.name,
        color: colors[deviceIndex % colors.length],
        valueFormatter: (value: number | null, { dataIndex }: { dataIndex?: number }) => {
          if (value == null || !Number.isFinite(value) || dataIndex == null) {
            return '0';
          }

          const metric = metrics[dataIndex];
          const { min, max } = metricExtents[dataIndex] ?? { min: 0, max: 0 };
          const normalizedDisplay = normalizeMetricValue(value, min, max);

          return `${formatMetricValue(metric.key, value)} (${formatNormalizedPercent(
            normalizedDisplay
          )} نسبی)`;
        },
      })),
    [colors, devices, metricExtents, metrics]
  );

  if (devices.length === 0 || dataset.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', direction: 'ltr', overflowX: 'auto' }}>
      <BarChart
        height={height}
        dataset={dataset}
        xAxis={[
          {
            scaleType: 'band',
            dataKey: 'metricLabel',
            tickLabelStyle: { fontSize: 12 },
          },
        ]}
        yAxis={[
          {
            position: 'left',
            label: 'مقدار واقعی',
          },
        ]}
        series={series}
        margin={{ top: 24, bottom: 72, left: 64, right: 24 }}
        slotProps={{
          legend: {
            direction: 'row',
            position: { vertical: 'bottom', horizontal: 'center' },
          },
          tooltip: {
            sx: {
              direction: 'rtl',
              '& .MuiTypography-root': {
                whiteSpace: 'pre-line',
              },
            },
          },
        }}
      />
    </Box>
  );
};

interface DeviceMetricsHeatmapProps {
  devices: DeviceMetricsEntry[];
  metrics: typeof PARALLEL_METRICS;
  metricExtents: MetricExtent[];
}

const DeviceMetricsHeatmap = ({
  devices,
  metrics,
  metricExtents,
}: DeviceMetricsHeatmapProps) => {
  const theme = useTheme();

  if (devices.length === 0) {
    return null;
  }

  const rows = metrics.map((metric, metricIndex) => {
    return {
      metric,
      values: devices.map((device) => {
        const rawValue = Number(device.metrics[metric.key] ?? 0);
        const { min, max } = metricExtents[metricIndex] ?? { min: 0, max: 0 };
        const normalizedValue = normalizeMetricValue(rawValue, min, max);

        return {
          device: device.name,
          rawValue,
          normalizedValue,
        };
      }),
    };
  });

  const dividerColor = alpha(theme.palette.text.primary, 0.12);
  const headerBackground = theme.palette.mode === 'dark'
    ? alpha('#ffffff', 0.06)
    : alpha('#000000', 0.04);

  const getCellBackground = (percent: number) => {
    const ratio = Math.max(0, Math.min(100, percent)) / 100;
    const baseColor = theme.palette.primary.main;
    const alphaValue = 0.15 + ratio * 0.65;
    return alpha(baseColor, alphaValue);
  };

  const getCellColor = (percent: number) => {
    const ratio = Math.max(0, Math.min(100, percent)) / 100;
    if (ratio > 0.6) {
      return theme.palette.getContrastText(theme.palette.primary.main);
    }
    return theme.palette.text.primary;
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `minmax(160px, 1.2fr) repeat(${devices.length}, minmax(120px, 1fr))`,
          border: `1px solid ${dividerColor}`,
          borderRadius: 2,
          overflow: 'hidden',
          direction: 'rtl',
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            fontWeight: 600,
            textAlign: 'right',
            bgcolor: headerBackground,
            borderLeft: `1px solid ${dividerColor}`,
            borderBottom: `1px solid ${dividerColor}`,
          }}
        >
          شاخص
        </Box>
        {devices.map((device, index) => (
          <Box
            key={device.name}
            sx={{
              px: 2,
              py: 1.5,
              fontWeight: 600,
              textAlign: 'center',
              bgcolor: headerBackground,
              borderLeft:
                index === devices.length - 1 ? 'none' : `1px solid ${dividerColor}`,
              borderBottom: `1px solid ${dividerColor}`,
            }}
          >
            {device.name}
          </Box>
        ))}
        {rows.map(({ metric, values }) => (
          <Fragment key={metric.key}>
            <Box
              sx={{
                px: 2,
                py: 1.5,
                fontSize: 14,
                borderTop: `1px solid ${dividerColor}`,
                borderLeft: `1px solid ${dividerColor}`,
                display: 'flex',
                alignItems: 'center',
                bgcolor: theme.palette.background.paper,
              }}
            >
              {metric.label}
            </Box>
            {values.map((value, valueIndex) => {
              const backgroundColor = getCellBackground(value.normalizedValue);
              const textColor = getCellColor(value.normalizedValue);

              return (
                <Tooltip
                  key={`${metric.key}-${value.device}`}
                  title={
                    `${value.device} • ${metric.label}\n` +
                    `${formatMetricValue(metric.key, value.rawValue)} مقدار واقعی\n` +
                    `${formatNormalizedPercent(value.normalizedValue)} سهم نسبی`
                  }
                  arrow
                >
                  <Box
                    sx={{
                      px: 1.5,
                      py: 1.5,
                      textAlign: 'center',
                      borderTop: `1px solid ${dividerColor}`,
                      borderLeft:
                        valueIndex === values.length - 1
                          ? 'none'
                          : `1px solid ${dividerColor}`,
                      bgcolor: backgroundColor,
                      color: textColor,
                      fontSize: 13,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatNormalizedPercent(value.normalizedValue)}
                  </Box>
                </Tooltip>
              );
            })}
          </Fragment>
        ))}
      </Box>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ mt: 1.5, direction: 'rtl' }}
      >
        <Box
          sx={{
            width: 120,
            height: 12,
            borderRadius: 6,
            background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${
              alpha(theme.palette.primary.main, 0.8)
            } 100%)`,
          }}
        />
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          شدت رنگ بیشتر به معنی سهم نسبی بالاتر در شاخص است.
        </Typography>
      </Stack>

    </Box>
  );
};


export const DiskOverview = () => {
  const { data, isLoading, error } = useDisk();
  const theme = useTheme();
  const chartSize = useMediaQuery(theme.breakpoints.down('sm')) ? 180 : 230;

  const cardSx = createCardSx(theme);

  const disksWithUsage = useMemo(
    () =>
      (data?.disks ?? []).filter((disk) => disk.usage && disk.usage.total > 0),
    [data?.disks]
  );

  const isDarkMode = theme.palette.mode === 'dark';
  const cardBorderColor = isDarkMode
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)';
  const statsDividerColor = isDarkMode
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)';
  const statsBackground = isDarkMode
    ? 'rgba(255, 255, 255, 0.04)'
    : 'rgba(0, 0, 0, 0.03)';

  if (isLoading) {
    return (
      <Box sx={cardSx}>
        <Typography variant="body2">در حال بارگذاری اطلاعات دیسک...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={cardSx}>
        <Typography variant="body2" sx={{ color: 'var(--color-error)' }}>
          خطا در دریافت داده‌های دیسک: {error.message}
        </Typography>
      </Box>
    );
  }

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
          💽
        </Box>
        نمای کلی مصرف دیسک
      </Typography>

      {disksWithUsage.length > 0 ? (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {disksWithUsage.map((disk) => {
            const usage = disk.usage ?? {};
            const totalRaw = safeNumber(usage.total);
            const usedRaw = safeNumber(usage.used);
            const freeRaw = safeNumber(usage.free);

            const nonNegativeUsed = Math.max(usedRaw, 0);
            const nonNegativeFree = Math.max(freeRaw, 0);
            const derivedTotal =
              totalRaw > 0 ? totalRaw : nonNegativeUsed + nonNegativeFree;
            const safeTotal =
              derivedTotal > 0
                ? derivedTotal
                : nonNegativeUsed + nonNegativeFree;
            const boundedUsed =
              safeTotal > 0
                ? Math.min(nonNegativeUsed, safeTotal)
                : nonNegativeUsed;
            const fallbackFree =
              safeTotal > boundedUsed ? safeTotal - boundedUsed : 0;
            const boundedFree =
              nonNegativeFree > 0
                ? Math.min(
                    nonNegativeFree,
                    fallbackFree > 0 ? fallbackFree : nonNegativeFree
                  )
                : fallbackFree;
            const percentValueRaw = usage.percent;
            const safePercent =
              percentValueRaw != null &&
              Number.isFinite(Number(percentValueRaw))
                ? clampPercent(Number(percentValueRaw))
                : safeTotal > 0
                  ? clampPercent((boundedUsed / safeTotal) * 100)
                  : 0;
            const percentText = `${diskPercentFormatter.format(safePercent)}٪`;
            const chartRemaining =
              safeTotal > 0
                ? Math.max(safeTotal - boundedUsed, 0)
                : boundedFree;
            const chartOuterRadius = Math.min(110, chartSize / 2 - 8);

            const chartInnerRadius = Math.max(
              chartOuterRadius - 24,
              chartOuterRadius * 0.22
            );
            const stats: Array<{ key: string; label: string; value: string }> =
              [
                {
                  key: 'used',
                  label: 'استفاده‌شده',
                  value: formatBytes(boundedUsed),
                },
                { key: 'free', label: 'خالی', value: formatBytes(boundedFree) },
                { key: 'total', label: 'کل', value: formatBytes(safeTotal) },
                { key: 'percent', label: 'درصد استفاده', value: percentText },
              ];
            const usedColor = theme.palette.primary.main;
            const remainingColor = isDarkMode
              ? 'rgba(255, 255, 255, 0.28)'
              : 'rgba(0, 0, 0, 0.16)';
            const fadedColor = isDarkMode
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.08)';

            return (
              <Box
                key={disk.device}
                sx={{
                  // width: '100%',
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: 'var(--color-card-bg)',
                  border: `1px solid ${cardBorderColor}`,
                  boxShadow: '0 16px 32px rgba(0, 0, 0, 0.18)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {disk.device} ({disk.mountpoint || 'نامشخص'})
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      سیستم فایل: {(disk.fstype || '-').toUpperCase()}
                    </Typography>
                  </Box>
                </Stack>

                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <PieChart
                    series={[
                      {
                        id: `${disk.device}-usage`,
                        data: [
                          {
                            id: 'used',
                            value: boundedUsed,
                            label: 'استفاده‌شده',
                            color: usedColor,
                          },
                          {
                            id: 'remaining',
                            value: chartRemaining,
                            label: 'باقی‌مانده',
                            color: remainingColor,
                          },
                        ],
                        innerRadius: 50,
                        outerRadius: chartOuterRadius,
                        paddingAngle: 1.2,
                        cornerRadius: 5,
                        startAngle: 0,
                        endAngle: 360,
                        highlightScope: { fade: 'global', highlight: 'item' },
                        faded: {
                          innerRadius: Math.max(
                            chartInnerRadius - 6,
                            chartInnerRadius * 0.9
                          ),
                          additionalRadius: -12,
                          color: fadedColor,
                        },
                        valueFormatter: (item) => {
                          if (item.id === 'used') {
                            return [
                              `${formatBytes(boundedUsed)} : استفاده‌شده `,
                              `${formatBytes(safeTotal)} : کل `,
                              `${formatBytes(boundedFree)} : خالی `,
                              `${percentText} : درصد استفاده `,
                            ].join('\n');
                          }
                          return `${formatBytes(chartRemaining)} : باقی‌مانده`;
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
                          direction: 'rtl',
                          '& .MuiChartsTooltip-table': {
                            direction: 'rtl',
                            color: 'var(--color-text)',
                          },
                          '& .MuiChartsTooltip-cell': {
                            whiteSpace: 'pre-line',
                            fontFamily: 'var(--font-vazir)',
                            color: 'var(--color-text)',
                          },
                          '& .MuiChartsTooltip-label': {
                            color: 'var(--color-text)',
                          },
                          '& .MuiChartsTooltip-value': {
                            color: 'var(--color-text)',
                          },
                        },
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      pointerEvents: 'none',
                      gap: 0.5,
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily: 'var(--font-didot)',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                      }}
                    >
                      {percentText}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      درصد استفاده
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    width: '100%',
                    bgcolor: statsBackground,
                    borderRadius: 2,
                    px: 2,
                    py: 1.5,
                    border: `1px solid ${statsDividerColor}`,

                    display: 'flex',
                    flexDirection: 'column',
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
                        sx={{
                          fontWeight: 500,
                          color: theme.palette.text.secondary,
                        }}
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
          })}
        </Box>
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          داده‌ای برای مصرف دیسک در دسترس نیست.
        </Typography>
      )}
    </Box>
  );
};

const Disk = () => {
  const { data, isLoading, error } = useDisk();
  const theme = useTheme();
  const cardSx = createCardSx(theme);

  const ioSummary = useMemo<DeviceMetricsDatum[]>(() => {

  const ioSummary = useMemo<DeviceMetricsEntry[]>(() => {

  const ioSummary = useMemo<DeviceMetricsEntry[]>(() => {

    if (!data?.summary?.disk_io_summary) {
      return [];
    }

    return Object.entries(data.summary.disk_io_summary)
      .map(([device, metrics]) => ({
        name: device,
        metrics: normalizeMetrics(metrics),
      }))
      .filter((entry) =>
        IO_METRICS.some((metric) => metric.getValue(entry.metrics) > 0)
      );
  }, [data?.summary?.disk_io_summary]);

  const topDevices = useMemo(() => {
    const score = (metrics: NormalizedMetrics) => {
      return (
        metrics.busy_time +
        metrics.read_count +
        metrics.write_count +
        metrics.read_bytes / 1_000_000 +
        metrics.write_bytes / 1_000_000
      );
    };

    return [...ioSummary]
      .sort((a, b) => score(b.metrics) - score(a.metrics))
      .slice(0, 5);
  }, [ioSummary]);

  const { dataset: ioLineDataset, maxValues: ioMetricMaxValues } = useMemo(
    () => {
      const maxValues = IO_METRICS.reduce(
        (acc, metric) => {
          const values = topDevices.map((item) => {
            const rawValue = metric.getValue(item.metrics);
            return Number.isFinite(rawValue) ? rawValue : 0;
          });

          acc[metric.key] = Math.max(...values, 0);
          return acc;
        },
        {} as Record<keyof DiskIOStats, number>
      );

      const dataset = topDevices.map((item) => {
        const entry: Record<string, string | number> = { device: item.name };

        IO_METRICS.forEach((metric) => {
          const rawValue = metric.getValue(item.metrics);
          const max = maxValues[metric.key];
          if (max > 0 && Number.isFinite(rawValue)) {
            entry[metric.key] = clampPercent((rawValue / max) * 100);
          } else {
            entry[metric.key] = 0;
          }
        });

        return entry;
      });

      return { dataset, maxValues };
    },
    [topDevices]
  );

  const chartColors = useMemo(
    () => [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.error.main,
    ],
    [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.error.main,
    ]
  );

  const metricExtents = useMemo(
    () => computeMetricExtents(topDevices, PARALLEL_METRICS),

    [topDevices]
  );

  if (isLoading) {
    return (
      <Box sx={cardSx}>
        <Typography variant="body2">در حال بارگذاری اطلاعات دیسک...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={cardSx}>
        <Typography variant="body2" sx={{ color: 'var(--color-error)' }}>
          خطا در دریافت داده‌های دیسک: {error.message}
        </Typography>
      </Box>
    );
  }

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
          💽
        </Box>
        وضعیت دیسک
      </Typography>

      <Divider sx={{ my: 1 }} />

      <Stack spacing={3}>
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          مقایسه شاخص‌های ورودی/خروجی (نمونه انواع نمودارها)
        </Typography>
        {topDevices.length > 0 ? (
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                نمودار رادار (Radar Chart)
              </Typography>
              <DeviceMetricsRadarChart
                devices={topDevices}
                metrics={PARALLEL_METRICS}
                metricExtents={metricExtents}
                colors={chartColors}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                نمودار ستونی خوشه‌ای (Grouped Columns)
              </Typography>
              <DeviceMetricsGroupedBarChart
                devices={topDevices}
                metrics={PARALLEL_METRICS}
                metricExtents={metricExtents}
                colors={chartColors}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                ماتریس حرارتی (Heatmap)
              </Typography>
              <DeviceMetricsHeatmap
                devices={topDevices}
                metrics={PARALLEL_METRICS}
                metricExtents={metricExtents}
              />
            </Box>
          </Stack>

        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            شاخص قابل توجهی برای نمایش وجود ندارد.
          </Typography>
        )}
      </Stack>

      <Divider sx={{ my: 1 }} />

      <Stack spacing={2}>
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          مقایسه حجم خواندن و نوشتن (GB)
        </Typography>
        {barChartDataset.length > 0 ? (
          <Box sx={{ width: '100%', direction: 'ltr' }}>
            <BarChart
              dataset={barChartDataset}
              xAxis={[{ scaleType: 'band', dataKey: 'device' }]}
              yAxis={[
                {
                  position: 'left',
                  tickSize: 18, // ⬅ increase gap between numbers and the y-axis line
                  width: 56, // ⬅ reserve room so labels don’t get clipped
                  tickLabelStyle: { fill: 'var(--color-text)' },
                },
              ]}
              series={[
                {
                  dataKey: 'readGB',
                  label: 'خواندن (GB)',
                  stack: 'total',
                  color: theme.palette.primary.main,
                  valueFormatter: (value) => `${(value ?? 0).toFixed(2)} GB`,
                },
                {
                  dataKey: 'writeGB',
                  label: 'نوشتن (GB)',
                  stack: 'total',
                  color: theme.palette.warning.main,
                  valueFormatter: (value) => `${(value ?? 0).toFixed(2)} GB`,
                },
              ]}
              height={280}
              margin={{ top: 60, right: 40, left: 40 }}
              slotProps={{
                tooltip: { sx: tooltipSx },
                legend: {
                  sx: {
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-vazir)',
                  },
                  position: { vertical: 'top', horizontal: 'center' },
                },
              }}
            />
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            برای ترسیم نمودار خواندن/نوشتن داده‌ای یافت نشد.
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default Disk;
