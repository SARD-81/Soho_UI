import type { ChipProps } from '@mui/material';
import { formatBytes } from '../../utils/formatters';

type StatusChipColor = ChipProps['color'];

export const STATUS_STYLES: Record<
  'active' | 'warning' | 'maintenance' | 'unknown',
  { bg: string; color: string; label: string; chipColor: StatusChipColor }
> = {
  active: {
    bg: 'rgba(0, 198, 169, 0.18)',
    color: 'var(--color-primary)',
    label: 'Online',
    chipColor: 'success',
  },
  warning: {
    bg: 'rgba(227, 160, 8, 0.18)',
    color: '#e3a008',
    label: 'نیاز به بررسی',
    chipColor: 'warning',
  },
  maintenance: {
    bg: 'rgba(35, 167, 213, 0.18)',
    color: 'var(--color-primary-light)',
    label: 'در حال ارتقاء',
    chipColor: 'info',
  },
  unknown: {
    bg: 'rgba(120, 120, 120, 0.18)',
    color: 'var(--color-secondary)',
    label: 'نامشخص',
    chipColor: 'default',
  },
};

export const clampPercent = (value: number | null | undefined) => {
  if (value == null || !Number.isFinite(value)) {
    return null;
  }

  if (value < 0) {
    return 0;
  }

  if (value > 100) {
    return 100;
  }

  return value;
};

export const resolveStatus = (health?: string) => {
  if (!health) {
    return {
      key: 'unknown' as const,
      label: STATUS_STYLES.unknown.label,
      color: STATUS_STYLES.unknown.chipColor,
    };
  }

  const normalized = health.toLowerCase();

  if (normalized.includes('online') || normalized.includes('healthy')) {
    return {
      key: 'active' as const,
      label: STATUS_STYLES.active.label,
      color: STATUS_STYLES.active.chipColor,
    };
  }

  if (
    normalized.includes('degraded') ||
    normalized.includes('fault') ||
    normalized.includes('offline') ||
    normalized.includes('error')
  ) {
    return {
      key: 'warning' as const,
      label: STATUS_STYLES.warning.label,
      color: STATUS_STYLES.warning.chipColor,
    };
  }

  if (
    normalized.includes('resilver') ||
    normalized.includes('rebuild') ||
    normalized.includes('replace') ||
    normalized.includes('sync')
  ) {
    return {
      key: 'maintenance' as const,
      label: STATUS_STYLES.maintenance.label,
      color: STATUS_STYLES.maintenance.chipColor,
    };
  }

  return { key: 'unknown' as const, label: health, color: STATUS_STYLES.unknown.chipColor };
};

export const formatCapacity = (value: number | null | undefined) =>
  formatBytes(value, {
    locale: 'en-US',
    maximumFractionDigits: 1,
    fallback: '-',
  });
