import type { DiskIOStats } from '../../@types/disk';
import type {
  DiskMetricConfig,
  NormalizedMetrics,
} from '../../@types/components/disk';
import { formatBytes, formatLargeNumber } from '../../util/formatters';

export const BYTES_IN_GB = 1024 ** 3;

export const METRIC_KEYS: Array<keyof DiskIOStats> = [
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

export const normalizeMetrics = (
  metrics?: Partial<DiskIOStats>
): NormalizedMetrics =>
  METRIC_KEYS.reduce<NormalizedMetrics>(
    (acc, key) => {
      acc[key] = Number(metrics?.[key] ?? 0);
      return acc;
    },
    {} as NormalizedMetrics
  );

export const IO_METRICS: DiskMetricConfig[] = [
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

export const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

export const safeNumber = (value: unknown) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const diskPercentFormatter = new Intl.NumberFormat('fa-IR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
