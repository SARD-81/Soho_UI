import type { LocalNotification } from '../@types/notification';

export const NOTIFICATION_STORAGE_KEY_PREFIX = 'soho:notifications';
export const NOTIFICATION_TTL_DAYS = 10;

const TTL_IN_MS = NOTIFICATION_TTL_DAYS * 24 * 60 * 60 * 1000;

type StoredNotification = Partial<LocalNotification>;

export type UpsertLocalNotificationInput = Omit<
  LocalNotification,
  'id' | 'createdAt' | 'updatedAt' | 'expiresAt' | 'readAt'
> &
  Partial<Pick<LocalNotification, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt' | 'readAt'>>;

const isBrowser = () => typeof window !== 'undefined';

export const getNotificationStorageKey = (userKey?: string) =>
  `${NOTIFICATION_STORAGE_KEY_PREFIX}:${userKey || 'default'}`;

const isValidNotification = (notification: StoredNotification): notification is LocalNotification =>
  typeof notification.id === 'string' &&
  typeof notification.fingerprint === 'string' &&
  typeof notification.title === 'string' &&
  typeof notification.message === 'string' &&
  (notification.severity === 'info' ||
    notification.severity === 'warning' ||
    notification.severity === 'critical') &&
  (notification.source === 'startup-capacity-check' || notification.source === 'user-action') &&
  typeof notification.createdAt === 'string' &&
  typeof notification.updatedAt === 'string' &&
  typeof notification.expiresAt === 'string' &&
  (notification.readAt === null || typeof notification.readAt === 'string');

const sortNotifications = (notifications: LocalNotification[]) =>
  [...notifications].sort(
    (first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime(),
  );

const isExpired = (notification: LocalNotification, now = Date.now()) =>
  new Date(notification.expiresAt).getTime() <= now;

const createExpiresAt = (updatedAt: string) => new Date(new Date(updatedAt).getTime() + TTL_IN_MS).toISOString();

const createNotificationId = () => {
  if (isBrowser() && window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }

  return `notification-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const getNotifications = (userKey?: string): LocalNotification[] => {
  if (!isBrowser()) {
    return [];
  }

  const storageKey = getNotificationStorageKey(userKey);
  const storedValue = window.localStorage.getItem(storageKey);

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      window.localStorage.removeItem(storageKey);
      return [];
    }

    return sortNotifications(parsedValue.filter(isValidNotification));
  } catch {
    window.localStorage.removeItem(storageKey);
    return [];
  }
};

export const saveNotifications = (notifications: LocalNotification[], userKey?: string): void => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(getNotificationStorageKey(userKey), JSON.stringify(sortNotifications(notifications)));
};

export const cleanupExpiredNotifications = (userKey?: string): LocalNotification[] => {
  const activeNotifications = getNotifications(userKey).filter((notification) => !isExpired(notification));
  saveNotifications(activeNotifications, userKey);
  return activeNotifications;
};

export const upsertNotification = (
  input: UpsertLocalNotificationInput,
  userKey?: string,
): LocalNotification[] => {
  const notifications = cleanupExpiredNotifications(userKey);
  const now = new Date().toISOString();
  const existingNotification = notifications.find(
    (notification) => notification.fingerprint === input.fingerprint,
  );

  if (existingNotification) {
    const updatedNotification: LocalNotification = {
      ...existingNotification,
      title: input.title,
      message: input.message,
      severity: input.severity,
      source: input.source,
      entityType: input.entityType,
      entityId: input.entityId,
      updatedAt: now,
      expiresAt: createExpiresAt(now),
      readAt:
        existingNotification.severity === 'warning' && input.severity === 'critical'
          ? null
          : existingNotification.readAt,
      metadata: input.metadata,
    };

    const updatedNotifications = notifications.map((notification) =>
      notification.id === existingNotification.id ? updatedNotification : notification,
    );
    saveNotifications(updatedNotifications, userKey);
    return sortNotifications(updatedNotifications);
  }

  const newNotification: LocalNotification = {
    id: input.id ?? createNotificationId(),
    fingerprint: input.fingerprint,
    title: input.title,
    message: input.message,
    severity: input.severity,
    source: input.source,
    entityType: input.entityType,
    entityId: input.entityId,
    createdAt: now,
    updatedAt: now,
    expiresAt: createExpiresAt(now),
    readAt: input.readAt ?? null,
    metadata: input.metadata,
  };

  const updatedNotifications = [...notifications, newNotification];
  saveNotifications(updatedNotifications, userKey);
  return sortNotifications(updatedNotifications);
};

export const markNotificationRead = (id: string, userKey?: string): LocalNotification[] => {
  const now = new Date().toISOString();
  const updatedNotifications = cleanupExpiredNotifications(userKey).map((notification) =>
    notification.id === id ? { ...notification, readAt: notification.readAt ?? now } : notification,
  );
  saveNotifications(updatedNotifications, userKey);
  return sortNotifications(updatedNotifications);
};

export const markAllNotificationsRead = (userKey?: string): LocalNotification[] => {
  const now = new Date().toISOString();
  const updatedNotifications = cleanupExpiredNotifications(userKey).map((notification) => ({
    ...notification,
    readAt: notification.readAt ?? now,
  }));
  saveNotifications(updatedNotifications, userKey);
  return sortNotifications(updatedNotifications);
};

export const clearNotification = (id: string, userKey?: string): LocalNotification[] => {
  const updatedNotifications = cleanupExpiredNotifications(userKey).filter(
    (notification) => notification.id !== id,
  );
  saveNotifications(updatedNotifications, userKey);
  return sortNotifications(updatedNotifications);
};
