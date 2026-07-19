import type { DiskInventoryItem } from '../@types/disk';
import type { UpsertLocalNotificationInput } from './notificationStorage';

export const DISK_TEMPERATURE_WARNING_CELSIUS = 60;
export const DISK_TEMPERATURE_CRITICAL_CELSIUS = 70;

const normalizeTemperature = (value: unknown) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const resolveDiskEntityId = (disk: DiskInventoryItem) =>
  String(disk.wwn ?? disk.wwid ?? disk.uuid ?? disk.disk).trim();

export const createDiskTemperatureNotification = (
  disk: DiskInventoryItem
): UpsertLocalNotificationInput | null => {
  const temperature = normalizeTemperature(disk.temperature_celsius);

  if (temperature == null || temperature < DISK_TEMPERATURE_WARNING_CELSIUS) {
    return null;
  }

  const entityId = resolveDiskEntityId(disk);
  const diskName = String(disk.disk || entityId || 'نامشخص').trim();
  const isCritical = temperature >= DISK_TEMPERATURE_CRITICAL_CELSIUS;
  const formattedTemperature = temperature.toLocaleString('fa-IR', {
    maximumFractionDigits: 1,
  });

  return {
    fingerprint: `disk-temperature:${entityId}`,
    title: isCritical ? 'دمای بحرانی دیسک' : 'افزایش دمای دیسک',
    message: isCritical
      ? `دمای دیسک ${diskName} به ${formattedTemperature} درجه سانتی‌گراد رسیده و در محدوده بحرانی قرار دارد. برای جلوگیری از آسیب، وضعیت دیسک و سامانه خنک‌کننده را فوراً بررسی کنید.`
      : `دمای دیسک ${diskName} به ${formattedTemperature} درجه سانتی‌گراد رسیده است. گردش هوا و وضعیت خنک‌سازی سامانه را بررسی کنید.`,
    severity: isCritical ? 'critical' : 'warning',
    source: 'disk-temperature-check',
    entityType: 'disk',
    entityId,
    metadata: {
      diskName,
      temperatureCelsius: temperature,
      warningThresholdCelsius: DISK_TEMPERATURE_WARNING_CELSIUS,
      criticalThresholdCelsius: DISK_TEMPERATURE_CRITICAL_CELSIUS,
    },
  };
};
