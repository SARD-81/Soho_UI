import type { LocalNotificationSeverity } from '../@types/notification';
import type { UpsertLocalNotificationInput } from './notificationStorage';

export type ResourceStatusEntityType = 'pool' | 'disk' | 'service';

export interface ResourceStatusSnapshotItem {
  entityType: ResourceStatusEntityType;
  entityId: string;
  entityName: string;
  status: string;
}

export interface ResourceStatusChange {
  entityType: ResourceStatusEntityType;
  entityId: string;
  entityName: string;
  previousStatus: string;
  currentStatus: string;
}

const EMPTY_STATUS_VALUES = new Set(['', '-', 'UNKNOWN', 'N/A', 'NULL']);
const HEALTHY_STATUSES = new Set([
  'ONLINE',
  'OK',
  'HEALTHY',
  'AVAILABLE',
  'ACTIVE',
  'READY',
  'RUNNING',
]);
const WARNING_STATUSES = new Set([
  'DEGRADED',
  'WARNING',
  'WARN',
  'REMOVED',
  'SUSPENDED',
]);
const CRITICAL_STATUSES = new Set([
  'FAULTED',
  'FAILED',
  'FAIL',
  'OFFLINE',
  'UNAVAIL',
  'UNAVAILABLE',
  'ERROR',
  'CRITICAL',
  'STOPPED',
  'INACTIVE',
  'DEAD',
  'MASKED',
]);

export const normalizeResourceStatus = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim().toUpperCase();
  return EMPTY_STATUS_VALUES.has(normalizedValue) ? null : normalizedValue;
};

export const resolveStatusSeverity = (
  _previousStatus: string,
  currentStatus: string
): LocalNotificationSeverity => {
  const normalizedCurrentStatus =
    normalizeResourceStatus(currentStatus) ?? currentStatus.trim().toUpperCase();

  if (HEALTHY_STATUSES.has(normalizedCurrentStatus)) {
    return 'info';
  }

  if (CRITICAL_STATUSES.has(normalizedCurrentStatus)) {
    return 'critical';
  }

  if (WARNING_STATUSES.has(normalizedCurrentStatus)) {
    return 'warning';
  }

  return 'warning';
};

const resolveStatusTitle = (
  severity: LocalNotificationSeverity,
  entityType: ResourceStatusEntityType
) => {
  if (entityType === 'service') {
    if (severity === 'info') {
      return 'سرویس مجدداً در حال اجرا است';
    }

    if (severity === 'critical') {
      return 'توقف سرویس سامانه';
    }

    return 'تغییر وضعیت سرویس';
  }

  if (severity === 'info') {
    return 'بازگشت وضعیت به حالت عادی';
  }

  if (severity === 'critical') {
    return 'تغییر وضعیت بحرانی';
  }

  return 'تغییر وضعیت هشدارآمیز';
};

const resolveEntityLabel = (entityType: ResourceStatusEntityType) => {
  if (entityType === 'pool') return 'Pool';
  if (entityType === 'service') return 'سرویس';
  return 'دیسک';
};

export const createResourceStatusChangeNotification = (
  change: ResourceStatusChange
): UpsertLocalNotificationInput => {
  const severity = resolveStatusSeverity(
    change.previousStatus,
    change.currentStatus
  );
  const detectedAt = new Date().toISOString();

  return {
    fingerprint: `status-change:${change.entityType}:${change.entityId}:${change.previousStatus}->${change.currentStatus}`,
    title: resolveStatusTitle(severity, change.entityType),
    message: `وضعیت ${resolveEntityLabel(change.entityType)} «${change.entityName}» از «${change.previousStatus}» به «${change.currentStatus}» تغییر کرد.`,
    severity,
    source: 'resource-status-change-check',
    entityType: change.entityType,
    entityId: change.entityId,
    metadata: {
      previousStatus: change.previousStatus,
      currentStatus: change.currentStatus,
      entityName: change.entityName,
      detectedAt,
    },
  };
};
