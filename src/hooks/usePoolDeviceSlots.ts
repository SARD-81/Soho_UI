import { useQuery } from '@tanstack/react-query';
import type { DiskInventoryItem } from '../@types/disk';
import type { ZpoolDeviceEntry, ZpoolDeviceResponse } from '../@types/zpool';
import { fetchDiskDetail, normalizeErrorMessage } from '../lib/diskApi';
import axiosInstance from '../lib/axiosInstance';

const DEFAULT_POOL_DEVICE_ERROR_MESSAGE = 'امکان دریافت دستگاه‌های فضای یکپارچه وجود ندارد.';

export interface PoolDiskSlot {
  diskName: string;
  slotNumber: string | number | null;
  wwn: string | null;
  path: string | null;
  detail: DiskInventoryItem | null;
}

export type PoolSlotMap = Record<string, PoolDiskSlot[]>;

export interface PoolDeviceSlotsResult {
  slotsByPool: PoolSlotMap;
  errorsByPool: Record<string, string>;
}

const normalizeDiskName = (device: ZpoolDeviceEntry) => {
  const candidates = [device.disk_name, device.full_disk_name, device.full_path_name];

  for (const candidate of candidates) {
    const normalized = String(candidate ?? '').replace(/^\/dev\//, '').trim();
    if (normalized) {
      return normalized;
    }
  }

  return '';
};

const normalizeDevicePath = (
  device: ZpoolDeviceEntry,
  detail: DiskInventoryItem | null,
  diskName: string
) => {
  const candidates = [
    device.full_path_name,
    device.full_disk_name,
    detail?.device_path,
    detail?.partitions?.[0]?.path,
    device.disk_name,
    diskName,
  ];

  for (const candidate of candidates) {
    const normalized = String(candidate ?? '').trim();

    if (!normalized) {
      continue;
    }

    if (normalized.startsWith('/dev/')) {
      return normalized;
    }

    return `/dev/${normalized.replace(/^\/dev\//, '')}`;
  }

  return null;
};

const normalizeWwn = (value: unknown) => {
  const normalized = String(value ?? '').trim();
  return normalized.length > 0 ? normalized : null;
};

const fetchPoolDevices = async (poolName: string) => {
  const endpoint = `/api/zpool/${encodeURIComponent(poolName)}/devices/`;
  const { data } = await axiosInstance.get<ZpoolDeviceResponse>(endpoint);

  if (data.ok === false) {
    throw new Error(
      normalizeErrorMessage(data.error, DEFAULT_POOL_DEVICE_ERROR_MESSAGE)
    );
  }

  return Array.isArray(data.data) ? data.data : [];
};

const buildPoolSlotEntry = async (
  device: ZpoolDeviceEntry
): Promise<PoolDiskSlot | null> => {
  const diskName = normalizeDiskName(device);

  if (!diskName) {
    return null;
  }

  const detail = await fetchDiskDetail(diskName);

  if (!detail) {
    return null;
  }

  const wwn =
    normalizeWwn(detail.wwn) ||
    normalizeWwn(detail.wwid) ||
    normalizeWwn(device.full_disk_wwn) ||
    normalizeWwn(device.wwn) ||
    normalizeWwn(device.full_path_wwn);

  const path = normalizeDevicePath(device, detail, diskName);

  return {
    diskName,
    slotNumber: detail.slot_number ?? null,
    wwn,
    path,
    detail,
  };
};

const fetchPoolDeviceSlots = async (
  poolNames: string[]
): Promise<PoolDeviceSlotsResult> => {
  const uniquePoolNames = Array.from(
    new Set(poolNames.map((pool) => pool.trim()).filter(Boolean))
  );

  if (uniquePoolNames.length === 0) {
    return { slotsByPool: {}, errorsByPool: {} };
  }

  const slotsByPool: PoolSlotMap = {};
  const errorsByPool: Record<string, string> = {};

  await Promise.all(
    uniquePoolNames.map(async (poolName) => {
      try {
        const devices = await fetchPoolDevices(poolName);
        const diskDevices = devices.filter(
          (device) => !device.type || device.type?.toLowerCase() === 'disk'
        );

        const slots = await Promise.all(diskDevices.map(buildPoolSlotEntry));

        slotsByPool[poolName] = slots.filter((slot): slot is PoolDiskSlot =>
          Boolean(slot)
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : DEFAULT_POOL_DEVICE_ERROR_MESSAGE;
        errorsByPool[poolName] = message;
        slotsByPool[poolName] = [];
      }
    })
  );

  return { slotsByPool, errorsByPool };
};

interface UsePoolDeviceSlotsOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export const usePoolDeviceSlots = (
  poolNames: string[],
  options?: UsePoolDeviceSlotsOptions
) =>
  useQuery<PoolDeviceSlotsResult, Error>({
    queryKey: ['zpool', 'devices', 'slots', poolNames.join(',')], // کلید ثابت‌تر برای جلوگیری از ری‌رندر
    queryFn: () => fetchPoolDeviceSlots(poolNames),
    enabled: (options?.enabled ?? true) && poolNames.length > 0,
    refetchInterval: options?.refetchInterval ?? 30000, // افزایش به ۳۰ ثانیه
    staleTime: 20000, // داده‌ها تا ۲۰ ثانیه معتبر بمانند و Fetch مجدد نشوند
    gcTime: 60000,
    refetchOnWindowFocus: false,
  });