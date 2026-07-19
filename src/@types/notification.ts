export type LocalNotificationSeverity = 'info' | 'warning' | 'critical';

export type LocalNotificationSource =
  | 'startup-capacity-check'
  | 'resource-status-change-check'
  | 'disk-temperature-check'
  | 'user-action';

export type LocalNotificationEntityType =
  | 'pool'
  | 'filesystem'
  | 'disk'
  | 'service'
  | 'snmp'
  | 'share';

export interface LocalNotification {
  id: string;
  fingerprint: string;
  title: string;
  message: string;
  severity: LocalNotificationSeverity;
  source: LocalNotificationSource;
  entityType?: LocalNotificationEntityType;
  entityId?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  readAt: string | null;
  metadata?: Record<string, unknown>;
}
