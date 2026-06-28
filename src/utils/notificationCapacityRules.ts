import type { LocalNotificationSeverity } from '../@types/notification';
import type { UpsertLocalNotificationInput } from './notificationStorage';

export const CAPACITY_WARNING_THRESHOLD = 75;
export const CAPACITY_CRITICAL_THRESHOLD = 90;

export const normalizePercentValue = (value: unknown): number | null => {
  let numericValue: number | null = null;

  if (typeof value === 'number' && Number.isFinite(value)) {
    numericValue = value;
  }

  if (typeof value === 'string') {
    const cleanedValue = value.replace(/%/g, '').replace(/,/g, '.').trim();

    if (cleanedValue.length > 0) {
      const parsedValue = Number(cleanedValue);
      if (Number.isFinite(parsedValue)) {
        numericValue = parsedValue;
      }
    }
  }

  if (numericValue == null || numericValue < 0) {
    return null;
  }

  if (numericValue > 0 && numericValue <= 1) {
    return numericValue * 100;
  }

  return numericValue;
};

export const resolveCapacitySeverity = (
  percent: number,
): Extract<LocalNotificationSeverity, 'warning' | 'critical'> | null => {
  if (!Number.isFinite(percent)) {
    return null;
  }

  if (percent >= CAPACITY_CRITICAL_THRESHOLD) {
    return 'critical';
  }

  if (percent >= CAPACITY_WARNING_THRESHOLD) {
    return 'warning';
  }

  return null;
};

const formatPercent = (percent: number) =>
  new Intl.NumberFormat('fa-IR', {
    maximumFractionDigits: 1,
  }).format(percent);

export const createPoolCapacityNotification = (
  poolName: string,
  percent: number,
): UpsertLocalNotificationInput | null => {
  const severity = resolveCapacitySeverity(percent);

  if (severity == null) {
    return null;
  }

  const percentLabel = formatPercent(percent);

  return {
    fingerprint: `capacity:pool:${poolName}`,
    title:
      severity === 'critical'
        ? 'ظرفیت فضای یکپارچه بحرانی است'
        : 'ظرفیت فضای یکپارچه به آستانه هشدار رسیده است',
    message: `استخر «${poolName}» به ${percentLabel}٪ ظرفیت مصرف‌شده رسیده است.`,
    severity,
    source: 'startup-capacity-check',
    entityType: 'pool',
    entityId: poolName,
    metadata: {
      percent,
      threshold: severity === 'critical' ? CAPACITY_CRITICAL_THRESHOLD : CAPACITY_WARNING_THRESHOLD,
    },
  };
};

export const createFilesystemCapacityNotification = (
  poolName: string,
  filesystemName: string,
  percent: number,
): UpsertLocalNotificationInput | null => {
  const severity = resolveCapacitySeverity(percent);

  if (severity == null) {
    return null;
  }

  const entityId = `${poolName}/${filesystemName}`;
  const percentLabel = formatPercent(percent);

  return {
    fingerprint: `capacity:filesystem:${entityId}`,
    title:
      severity === 'critical'
        ? 'ظرفیت فایل‌سیستم بحرانی است'
        : 'ظرفیت فایل‌سیستم به آستانه هشدار رسیده است',
    message: `فایل‌سیستم «${entityId}» به ${percentLabel}٪ ظرفیت مصرف‌شده رسیده است.`,
    severity,
    source: 'startup-capacity-check',
    entityType: 'filesystem',
    entityId,
    metadata: {
      percent,
      threshold: severity === 'critical' ? CAPACITY_CRITICAL_THRESHOLD : CAPACITY_WARNING_THRESHOLD,
    },
  };
};
