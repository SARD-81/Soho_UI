import {
  Box,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useMemo } from 'react';
import type { DiskIOStats } from '../@types/disk';
import { useDisk } from '../hooks/useDisk';
import '../index.css';
import {
  formatBytes,
  formatDuration,
  formatLargeNumber,
} from '../utils/formatters';
import { createCardSx } from './cardStyles';

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

interface DeviceMetricDatum {
  name: string;
  metrics: NormalizedMetrics;
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
      whiteSpace: 'pre-line',
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

  const ioChartDataset = useMemo(
    () =>
      topDevices.map((item) => ({
        device: item.name,
        read_count: Math.max(safeNumber(item.metrics.read_count), 0),
        write_count: Math.max(safeNumber(item.metrics.write_count), 0),
        read_bytes: Math.max(safeNumber(item.metrics.read_bytes), 0),
        write_bytes: Math.max(safeNumber(item.metrics.write_bytes), 0),
        busy_time: Math.max(safeNumber(item.metrics.busy_time), 0),
      })),
    [topDevices]
  );

  const ioCountMax = useMemo(() => {
    const values = ioChartDataset.flatMap((item) => [
      item.read_count,
      item.write_count,
    ]);
    return Math.max(...values, 0);
  }, [ioChartDataset]);

  const ioBytesMax = useMemo(() => {
    const values = ioChartDataset.flatMap((item) => [
      item.read_bytes,
      item.write_bytes,
    ]);
    return Math.max(...values, 0);
  }, [ioChartDataset]);

  const readColor = theme.palette.primary.main;
  const writeColor = theme.palette.warning.main;

  const ioCountSeries = useMemo(
    () => [
      {
        id: 'read_count',
        dataKey: 'read_count',
        label: 'تعداد خواندن',
        color: readColor,
        curve: 'monotoneX' as const,
        showMark: true,
        valueFormatter: (
          value: number | null,
          { dataIndex }: { dataIndex: number }
        ) => {
          const safeValue = Math.max(safeNumber(value), 0);
          const busyTime = ioChartDataset[dataIndex]?.busy_time ?? 0;
          const busyLine = `زمان مشغولی: ${formatDuration(busyTime)}`;
          return `${formatLargeNumber(safeValue)} عملیات\n${busyLine}`;
        },
      },
      {
        id: 'write_count',
        dataKey: 'write_count',
        label: 'تعداد نوشتن',
        color: writeColor,
        curve: 'monotoneX' as const,
        showMark: true,
        valueFormatter: (value: number | null) => {
          const safeValue = Math.max(safeNumber(value), 0);
          return `${formatLargeNumber(safeValue)} عملیات`;
        },
      },
    ],
    [ioChartDataset, readColor, writeColor]
  );

  const ioBytesSeries = useMemo(
    () => [
      {
        id: 'read_bytes',
        dataKey: 'read_bytes',
        label: 'حجم خوانده‌شده',
        color: readColor,
        curve: 'monotoneX' as const,
        showMark: true,
        valueFormatter: (
          value: number | null,
          { dataIndex }: { dataIndex: number }
        ) => {
          const safeValue = Math.max(safeNumber(value), 0);
          const busyTime = ioChartDataset[dataIndex]?.busy_time ?? 0;
          const busyLine = `زمان مشغولی:   ${formatDuration(busyTime)}  `;
          return `${formatBytes(safeValue)}\n${busyLine}`;
        },
      },
      {
        id: 'write_bytes',
        dataKey: 'write_bytes',
        label: 'حجم نوشته‌شده',
        color: writeColor,
        curve: 'monotoneX' as const,
        showMark: true,
        valueFormatter: (value: number | null) => {
          const safeValue = Math.max(safeNumber(value), 0);
          return formatBytes(safeValue);
        },
      },
    ],
    [ioChartDataset, readColor, writeColor]
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
          مقایسه شاخص‌های ورودی/خروجی
        </Typography>
        {ioChartDataset.length > 0 ? (
          <Stack spacing={4}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                تعداد عملیات خواندن/نوشتن
              </Typography>
              <Box sx={{ width: '100%', direction: 'ltr' }}>
                <LineChart
                  dataset={ioChartDataset}
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
                      max: ioCountMax > 0 ? ioCountMax : undefined,
                      label: 'تعداد عملیات',
                      valueFormatter: (value: number) =>
                        formatLargeNumber(Math.max(value, 0)),
                      tickLabelStyle: { fill: 'var(--color-text)' },
                      labelStyle: { fill: 'var(--color-text)' },
                      position: 'left',
                      tickSize: 38,
                      width: 96,
                    },
                  ]}
                  axisHighlight={{ x: 'line' }}
                  grid={{ horizontal: true, vertical: false }}
                  height={300}
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
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                حجم داده خواندن/نوشتن
              </Typography>
              <Box sx={{ width: '100%', direction: 'ltr' }}>
                <LineChart
                  dataset={ioChartDataset}
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
                      max: ioBytesMax > 0 ? ioBytesMax : undefined,
                      label: 'حجم داده (بایت)',
                      valueFormatter: (value: number) =>
                        formatBytes(Math.max(value, 0)),
                      tickLabelStyle: { fill: 'var(--color-text)' },
                      labelStyle: { fill: 'var(--color-text)' },
                      position: 'left',
                      tickSize: 58,
                      width: 136,
                    },
                  ]}
                  axisHighlight={{ x: 'line' }}
                  grid={{ horizontal: true, vertical: false }}
                  height={300}
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
                  label: 'GB',
                  position: 'left',
                  tickSize: 38,
                  width: 86,
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
