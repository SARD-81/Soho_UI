import type { DiskIOStats } from '../disk';

export type NormalizedMetrics = Record<keyof DiskIOStats, number>;

export type DiskMetricConfig = {
  key: keyof DiskIOStats;
  label: string;
  getValue: (metrics: NormalizedMetrics) => number;
  format: (value: number) => string;
};

export interface DeviceMetricDatum {
  name: string;
  metrics: NormalizedMetrics;
}
