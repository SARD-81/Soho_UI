import {
  Box,
  Divider,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
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

const PARALLEL_METRICS: Array<{ key: keyof DiskIOStats; label: string }> = [
  { key: 'read_count', label: 'تعداد خواندن' },
  { key: 'write_count', label: 'تعداد نوشتن' },
  { key: 'read_bytes', label: 'حجم خوانده‌شده' },
  { key: 'write_bytes', label: 'حجم نوشته‌شده' },
  { key: 'busy_time', label: 'زمان مشغولی' },
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

interface ParallelDatum {
  name: string;
  metrics: NormalizedMetrics;
}

interface ParallelCoordinatesChartProps {
  data: ParallelDatum[];
  metrics: typeof PARALLEL_METRICS;
  colors: string[];
  height?: number;
}

const ParallelCoordinatesChart = ({
  data,
  metrics,
  colors,
  height = 260,
}: ParallelCoordinatesChartProps) => {
  const theme = useTheme();

  if (data.length === 0) {
    return null;
  }

  const width = Math.max(metrics.length * 140, 480);
  const leftPadding = 60;
  const rightPadding = 40;
  const topPadding = 24;
  const bottomPadding = 48;
  const innerWidth = width - leftPadding - rightPadding;
  const innerHeight = height - topPadding - bottomPadding;

  const axisPositions = metrics.map((_, index) => {
    if (metrics.length === 1) {
      return leftPadding + innerWidth / 2;
    }
    return leftPadding + (innerWidth * index) / (metrics.length - 1);
  });

  const axisScales = metrics.map((metric) => {
    const values = data.map((item) => item.metrics[metric.key] ?? 0);
    const max = Math.max(...values, 0);
    const min = 0;

    if (max === min) {
      return { min, max: max === 0 ? 1 : max * 1.05 };
    }

    return { min, max };
  });

  const axisColor =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.25)'
      : 'rgba(0, 0, 0, 0.35)';

  const textColor = 'var(--color-text)';

  const mapToY = (value: number, scale: { min: number; max: number }) => {
    if (scale.max === scale.min) {
      return topPadding + innerHeight / 2;
    }
    const ratio = (value - scale.min) / (scale.max - scale.min);
    return topPadding + innerHeight - ratio * innerHeight;
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'auto', direction: 'ltr' }}>
      <Box
        component="svg"
        viewBox={`0 0 ${width} ${height}`}
        sx={{ width: '100%', height }}
      >
        {metrics.map((metric, index) => {
          const x = axisPositions[index];
          const scale = axisScales[index];

          return (
            <g key={metric.key}>
              <line
                x1={x}
                y1={topPadding}
                x2={x}
                y2={height - bottomPadding}
                stroke={axisColor}
                strokeDasharray="4 4"
              />
              <text
                x={x}
                y={topPadding - 8}
                textAnchor="middle"
                fill={textColor}
                fontSize={11}
              >
                {formatLargeNumber(scale.max)}
              </text>
              <text
                x={x}
                y={height - bottomPadding + 18}
                textAnchor="middle"
                fill={textColor}
                fontSize={11}
              >
                {formatLargeNumber(scale.min)}
              </text>
              <text
                x={x}
                y={height - 12}
                textAnchor="middle"
                fill={textColor}
                fontSize={12}
                fontWeight={500}
              >
                {metric.label}
              </text>
            </g>
          );
        })}

        {data.map((item, dataIndex) => {
          const color = colors[dataIndex % colors.length];
          const path = metrics
            .map((metric, index) => {
              const value = item.metrics[metric.key] ?? 0;
              const x = axisPositions[index];
              const y = mapToY(value, axisScales[index]);
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ');

          return (
            <g key={item.name}>
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={2.2}
                opacity={0.85}
              />
              {metrics.map((metric, index) => {
                const value = item.metrics[metric.key] ?? 0;
                const x = axisPositions[index];
                const y = mapToY(value, axisScales[index]);

                return (
                  <circle key={metric.key} cx={x} cy={y} r={4} fill={color} />
                );
              })}
            </g>
          );
        })}
      </Box>

      <Stack
        direction="row"
        spacing={2}
        flexWrap="wrap"
        justifyContent="center"
        sx={{ mt: 2, px: 1 }}
      >
        {data.map((item, index) => {
          const color = colors[index % colors.length];

          return (
            <Stack
              key={item.name}
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ minWidth: 120 }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: color,
                  border: '1px solid rgba(0,0,0,0.2)',
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary }}
              >
                {item.name}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
};

const Disk = () => {
  const { data, isLoading, error } = useDisk();
  const theme = useTheme();

  const cardBorderColor =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(0, 0, 0, 0.08)';

  const cardSx = {
    width: '100%',
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
    },
    '& .MuiChartsTooltip-cell': {
      color: 'var(--color-text)',
      fontFamily: 'var(--font-vazir)',
    },
  } as const;

  const disksWithUsage = useMemo(
    () =>
      (data?.disks ?? []).filter((disk) => disk.usage && disk.usage.total > 0),
    [data?.disks]
  );

  const ioSummary = useMemo<ParallelDatum[]>(() => {
    if (!data?.summary?.disk_io_summary) {
      return [];
    }

    return Object.entries(data.summary.disk_io_summary)
      .map(([device, metrics]) => ({
        name: device,
        metrics: normalizeMetrics(metrics),
      }))
      .filter((entry) =>
        PARALLEL_METRICS.some((metric) => entry.metrics[metric.key] > 0)
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

  const barChartDataset = useMemo(
    () =>
      topDevices.map((item) => ({
        device: item.name,
        readGB: item.metrics.read_bytes / BYTES_IN_GB,
        writeGB: item.metrics.write_bytes / BYTES_IN_GB,
      })),
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
        وضعیت دیسک
      </Typography>

      <Stack spacing={2}>
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          نمای کلی مصرف دیسک
        </Typography>
        <Stack spacing={2}>
          {disksWithUsage.map((disk) => {
            const percent = Math.min(100, disk.usage.percent ?? 0);
            return (
              <Box
                key={disk.device}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.04)'
                      : 'rgba(0, 0, 0, 0.04)',
                  border: `1px solid ${
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.08)'
                  }`,
                }}
              >
                <Stack spacing={1.2}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {disk.device} ({disk.mountpoint || 'نامشخص'})
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      {(disk.fstype || '-').toUpperCase()}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={percent}
                    sx={{
                      height: 10,
                      borderRadius: 999,
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 999,
                      },
                    }}
                  />
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    justifyContent="space-between"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: 12,
                    }}
                  >
                    <Typography variant="caption">
                      استفاده‌شده: {formatBytes(disk.usage.used)}
                    </Typography>
                    <Typography variant="caption">
                      خالی: {formatBytes(disk.usage.free)}
                    </Typography>
                    <Typography variant="caption">
                      کل: {formatBytes(disk.usage.total)}
                    </Typography>
                    <Typography variant="caption">
                      درصد استفاده: {percent.toFixed(1)}%
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            );
          })}
          {disksWithUsage.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              داده‌ای برای مصرف دیسک در دسترس نیست.
            </Typography>
          )}
        </Stack>
      </Stack>

      <Divider sx={{ my: 1 }} />

      <Stack spacing={2}>
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          مقایسه شاخص‌های ورودی/خروجی (Parallel Coordinates)
        </Typography>
        {topDevices.length > 0 ? (
          <ParallelCoordinatesChart
            data={topDevices}
            metrics={PARALLEL_METRICS}
            colors={chartColors}
          />
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
              series={[
                {
                  dataKey: 'readGB',
                  label: 'خواندن (GB)',
                  valueFormatter: (value) => `${(value ?? 0).toFixed(2)} GB`,
                },
                {
                  dataKey: 'writeGB',
                  label: 'نوشتن (GB)',
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
