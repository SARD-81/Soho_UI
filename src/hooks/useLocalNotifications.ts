import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LocalNotification } from '../@types/notification';
import {
  cleanupExpiredNotifications,
  clearNotification as clearStoredNotification,
  getNotificationStorageKey,
  markAllNotificationsRead,
  markNotificationRead,
  upsertNotification,
  type UpsertLocalNotificationInput,
} from '../utils/notificationStorage';

export const useLocalNotifications = (userKey?: string) => {
  const [notifications, setNotifications] = useState<LocalNotification[]>(() =>
    cleanupExpiredNotifications(userKey),
  );

  const refreshNotifications = useCallback(() => {
    setNotifications(cleanupExpiredNotifications(userKey));
  }, [userKey]);

  const addOrUpdateNotification = useCallback(
    (input: UpsertLocalNotificationInput) => {
      const updatedNotifications = upsertNotification(input, userKey);
      setNotifications(updatedNotifications);
      return updatedNotifications;
    },
    [userKey],
  );

  const markAsRead = useCallback(
    (id: string) => {
      const updatedNotifications = markNotificationRead(id, userKey);
      setNotifications(updatedNotifications);
      return updatedNotifications;
    },
    [userKey],
  );

  const markAllAsRead = useCallback(() => {
    const updatedNotifications = markAllNotificationsRead(userKey);
    setNotifications(updatedNotifications);
    return updatedNotifications;
  }, [userKey]);

  const clearNotification = useCallback(
    (id: string) => {
      const updatedNotifications = clearStoredNotification(id, userKey);
      setNotifications(updatedNotifications);
      return updatedNotifications;
    },
    [userKey],
  );

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const storageKey = getNotificationStorageKey(userKey);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKey) {
        refreshNotifications();
      }
    };

    const handleNotificationChange = () => {
      refreshNotifications();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('soho:notifications:capacity-summary', handleNotificationChange);
    window.addEventListener('soho:notifications:status-change-summary', handleNotificationChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('soho:notifications:capacity-summary', handleNotificationChange);
      window.removeEventListener('soho:notifications:status-change-summary', handleNotificationChange);
    };
  }, [refreshNotifications, userKey]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.readAt === null).length,
    [notifications],
  );

  return {
    notifications,
    unreadCount,
    refreshNotifications,
    addOrUpdateNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
  };
};
