import {
  Box,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import type { SeriesValueFormatterContext } from '@mui/x-charts/models/seriesType/common';
import { PieChart } from '@mui/x-charts/PieChart';
import { useMemo } from 'react';
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

const COUNT_METRICS: DiskMetricConfig[] = [
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
];

const BYTE_METRICS: DiskMetricConfig[] = [
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
];

const BUSY_TIME_METRIC: DiskMetricConfig = {
  key: 'busy_time',
  label: 'زمان مشغولی (ms)',
  getValue: (metrics) => metrics.busy_time,
  format: (value) => `${formatLargeNumber(Math.max(value, 0))} ms`,
};

const ACTIVITY_METRICS: DiskMetricConfig[] = [
  ...COUNT_METRICS,
  ...BYTE_METRICS,
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

const formatLargeNumber = (value: number) => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(0);
};

const formatBusyTime = (value: number) =>
  BUSY_TIME_METRIC.format(Math.max(value, 0));

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

interface DeviceMetricDatum {
  name: string;
  metrics: NormalizedMetrics;
}

type NormalizedChartDatum = {
  device: string;
  busy_time: number;
} & Partial<Record<keyof DiskIOStats, number>>;

interface NormalizedDatasetResult {
  dataset: NormalizedChartDatum[];
  maxValues: Partial<Record<keyof DiskIOStats, number>>;
}

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

const buildNormalizedDataset = (
  metrics: DiskMetricConfig[],
  devices: DeviceMetricDatum[]
): NormalizedDatasetResult => {
  const maxValues = metrics.reduce(
    (acc, metric) => {
      const values = devices.map((item) => {
        const rawValue = metric.getValue(item.metrics);
        return Number.isFinite(rawValue) ? rawValue : 0;
      });

      const metricMax = Math.max(...values, 0);
      acc[metric.key] = metricMax;
      return acc;
    },
    {} as NormalizedDatasetResult['maxValues']
  );

  const dataset = devices.map((item) => {
    const busyRaw = item.metrics.busy_time;
    const busyTime = Number.isFinite(busyRaw) ? Math.max(busyRaw, 0) : 0;

    const entry: NormalizedChartDatum = {
      device: item.name,
      busy_time: busyTime,
    };

    metrics.forEach((metric) => {
      const rawValue = metric.getValue(item.metrics);
      const max = maxValues[metric.key] ?? 0;

      if (max > 0 && Number.isFinite(rawValue)) {
        entry[metric.key] = clampPercent((rawValue / max) * 100);
      } else {
        entry[metric.key] = 0;
      }
    });

    return entry;
  });

  return { dataset, maxValues };
};

const Disk = () => {
  const { data, isLoading, error } = useDisk();
  const theme = useTheme();
  const cardSx = createCardSx(theme);

  const tooltipSx = {
    direction: 'rtl',
    '& .MuiChartsTooltip-table': {
      direction: 'rtl',
      color: 'var(--color-text)',
    },
    '& .MuiChartsTooltip-label': {
      color: 'var(--color-text)',
      fontFamily: 'var(--font-vazir)',
    },
    '& .MuiChartsTooltip-value': {
      color: 'var(--color-text)',
      fontFamily: 'var(--font-vazir)',
      whiteSpace: 'pre-line',
    },
    '& .MuiChartsTooltip-cell': {
      color: 'var(--color-text)',
      fontFamily: 'var(--font-vazir)',
    },
  } as const;

  const ioSummary = useMemo<DeviceMetricDatum[]>(() => {
    if (!data?.summary?.disk_io_summary) {
      return [];
    }

    return Object.entries(data.summary.disk_io_summary)
      .map(([device, metrics]) => ({
        name: device,
        metrics: normalizeMetrics(metrics),
      }))
      .filter((entry) =>
        ACTIVITY_METRICS.some((metric) => metric.getValue(entry.metrics) > 0)
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

  const { dataset: ioCountDataset, maxValues: ioCountMaxValues } = useMemo(
    () => buildNormalizedDataset(COUNT_METRICS, topDevices),
    [topDevices]
  );

  const { dataset: ioBytesDataset, maxValues: ioBytesMaxValues } = useMemo(
    () => buildNormalizedDataset(BYTE_METRICS, topDevices),
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

  const ioCountSeries = useMemo(
    () =>
      COUNT_METRICS.map((metric, index) => {
        const color = chartColors[index % chartColors.length];
        const max = ioCountMaxValues[metric.key] ?? 0;
        const includeBusyInfo = index === 0;

        return {
          dataKey: metric.key,
          label: metric.label,
          color,
          curve: 'monotoneX' as const,
          showMark: true,
          valueFormatter: (
            value: number | null,
            context: SeriesValueFormatterContext
          ) => {
            const dataIndex = context?.dataIndex ?? 0;
            const entry =
              dataIndex >= 0 && dataIndex < ioCountDataset.length
                ? ioCountDataset[dataIndex]
                : undefined;
            const busyTimeValue = Number(entry?.busy_time ?? 0);
            const busyInfo = includeBusyInfo
              ? `\nزمان مشغولی: ${formatBusyTime(busyTimeValue)}`
              : '';

            if (
              typeof value !== 'number' ||
              !Number.isFinite(value) ||
              max <= 0
            ) {
              const formatted = metric.format(0);
              return includeBusyInfo ? `${formatted}${busyInfo}` : formatted;
            }

            const actual = (value / 100) * max;
            const formatted = metric.format(actual);
            return includeBusyInfo ? `${formatted}${busyInfo}` : formatted;
          },
        };
      }),
    [chartColors, ioCountDataset, ioCountMaxValues]
  );

  const ioBytesSeries = useMemo(
    () =>
      BYTE_METRICS.map((metric, index) => {
        const color = chartColors[index % chartColors.length];
        const max = ioBytesMaxValues[metric.key] ?? 0;
        const includeBusyInfo = index === 0;

        return {
          dataKey: metric.key,
          label: metric.label,
          color,
          curve: 'monotoneX' as const,
          showMark: true,
          valueFormatter: (
            value: number | null,
            context: SeriesValueFormatterContext
          ) => {
            const dataIndex = context?.dataIndex ?? 0;
            const entry =
              dataIndex >= 0 && dataIndex < ioBytesDataset.length
                ? ioBytesDataset[dataIndex]
                : undefined;
            const busyTimeValue = Number(entry?.busy_time ?? 0);
            const busyInfo = includeBusyInfo
              ? `\nزمان مشغولی: ${formatBusyTime(busyTimeValue)}`
              : '';

            if (
              typeof value !== 'number' ||
              !Number.isFinite(value) ||
              max <= 0
            ) {
              const formatted = metric.format(0);
              return includeBusyInfo ? `${formatted}${busyInfo}` : formatted;
            }

            const actual = (value / 100) * max;
            const formatted = metric.format(actual);
            return includeBusyInfo ? `${formatted}${busyInfo}` : formatted;
          },
        };
      }),
    [chartColors, ioBytesDataset, ioBytesMaxValues]
  );

  const barChartDataset = useMemo(
    () =>
      topDevices.map((item) => ({
        device: item.name,
        readGB: item.metrics.read_bytes / BYTES_IN_GB,
        writeGB: item.metrics.write_bytes / BYTES_IN_GB,
      })),
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

      <Stack spacing={2}>
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          مقایسه شاخص‌های ورودی/خروجی (نمودار روند نرمال‌شده)
        </Typography>
        {ioCountDataset.length > 0 ? (
          <Stack spacing={3}>
            <Stack spacing={1.5}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                روند تعداد عملیات خواندن/نوشتن
              </Typography>
              <Box sx={{ width: '100%', direction: 'ltr' }}>
                <LineChart
                  dataset={ioCountDataset}
                  series={ioCountSeries}
                  xAxis={[
                    {
                      dataKey: 'device',
                      scaleType: 'band',
                      tickLabelStyle: { fill: 'var(--color-text)' },
                      labelStyle: { fill: 'var(--color-text)' },
                    },
                  ]}
                  yAxis={[
                    {
                      min: 0,
                      max: 105,
                      label: 'شاخص نرمال‌شده (٪)',
                      valueFormatter: (value: number) =>
                        `${diskPercentFormatter.format(value)}٪`,
                      tickLabelStyle: { fill: 'var(--color-text)' },
                      labelStyle: { fill: 'var(--color-text)' },
                      position: 'left',
                      tickSize: 45,
                      width: 96,
                    },
                  ]}
                  axisHighlight={{ x: 'line' }}
                  grid={{ horizontal: true, vertical: false }}
                  height={320}
                  margin={{ top: 40, right: 32, left: 56, bottom: 64 }}
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
            </Stack>
            <Stack spacing={1.5}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                روند حجم داده خواندن/نوشتن
              </Typography>
              <Box sx={{ width: '100%', direction: 'ltr' }}>
                <LineChart
                  dataset={ioBytesDataset}
                  series={ioBytesSeries}
                  xAxis={[
                    {
                      dataKey: 'device',
                      scaleType: 'band',
                      tickLabelStyle: { fill: 'var(--color-text)' },
                      labelStyle: { fill: 'var(--color-text)' },
                    },
                  ]}
                  yAxis={[
                    {
                      min: 0,
                      max: 105,
                      label: 'شاخص نرمال‌شده (٪)',
                      valueFormatter: (value: number) =>
                        `${diskPercentFormatter.format(value)}٪`,
                      tickLabelStyle: { fill: 'var(--color-text)' },
                      labelStyle: { fill: 'var(--color-text)' },
                      position: 'left',
                      tickSize: 45,
                      width: 96,
                    },
                  ]}
                  axisHighlight={{ x: 'line' }}
                  grid={{ horizontal: true, vertical: false }}
                  height={320}
                  margin={{ top: 40, right: 32, left: 56, bottom: 64 }}
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
            </Stack>
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
                  label: 'GB',
                  position: 'left',
                  tickSize: 28,
                  width: 96,
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
