import { useEffect, useMemo, useRef } from 'react';
import { cleanupExpiredNotifications, upsertNotification } from '../utils/notificationStorage';
import { createDiskTemperatureNotification } from '../utils/notificationTemperatureRules';
import { useDiskInventory } from './useDiskInventory';

export const DISK_TEMPERATURE_CHECK_INTERVAL_MS = 30_000;

export const useDiskTemperatureNotifications = (userKey?: string) => {
  const diskInventoryQuery = useDiskInventory({
    refetchInterval: DISK_TEMPERATURE_CHECK_INTERVAL_MS,
  });
  const checkedSignatureRef = useRef<string | null>(null);

  const temperatureSignature = useMemo(
    () =>
      JSON.stringify(
        (diskInventoryQuery.data ?? []).map((disk) => [
          disk.disk,
          disk.wwn,
          disk.wwid,
          disk.temperature_celsius,
        ])
      ),
    [diskInventoryQuery.data]
  );

  useEffect(() => {
    if (!diskInventoryQuery.isSuccess || !diskInventoryQuery.data) {
      return;
    }

    if (checkedSignatureRef.current === temperatureSignature) {
      return;
    }

    checkedSignatureRef.current = temperatureSignature;
    cleanupExpiredNotifications(userKey);

    let generatedCount = 0;

    diskInventoryQuery.data.forEach((disk) => {
      const notification = createDiskTemperatureNotification(disk);
      if (!notification) {
        return;
      }

      upsertNotification(notification, userKey);
      generatedCount += 1;
    });

    if (generatedCount > 0 && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('soho:notifications:temperature-summary', {
          detail: {
            count: generatedCount,
            message: 'دمای یک یا چند دیسک از محدوده مجاز عبور کرده است.',
          },
        })
      );
    }
  }, [diskInventoryQuery.data, diskInventoryQuery.isSuccess, temperatureSignature, userKey]);

  return {
    isChecking: diskInventoryQuery.isFetching,
    error: diskInventoryQuery.error ?? null,
  };
};
