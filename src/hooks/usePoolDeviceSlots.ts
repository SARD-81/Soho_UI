import { useQuery } from '@tanstack/react-query';
import type { DiskInventoryItem } from '../@types/disk';
import type { ZpoolDeviceEntry, ZpoolDeviceResponse } from '../@types/zpool';
import axiosInstance from '../lib/axiosInstance';
import { fetchDiskInventory, normalizeErrorMessage } from '../lib/diskApi';

const DEFAULT_POOL_DEVICE_ERROR_MESSAGE =
  'امکان دریافت دستگاه‌های فضای یکپارچه وجود ندارد.';

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

const normalizeLookupKey = (value: unknown) => {
  const normalized = String(value ?? '')
    .replace(/^\/dev\//, '')
    .trim();

  return normalized.length > 0 ? normalized : null;
};

const addInventoryLookupEntry = (
  lookup: Map<string, DiskInventoryItem>,
  key: unknown,
  disk: DiskInventoryItem
) => {
  const normalizedKey = normalizeLookupKey(key);

  if (normalizedKey && !lookup.has(normalizedKey)) {
    lookup.set(normalizedKey, disk);
  }
};

const buildDiskInventoryLookup = (inventory: DiskInventoryItem[]) => {
  const lookup = new Map<string, DiskInventoryItem>();

  inventory.forEach((disk) => {
    addInventoryLookupEntry(lookup, disk.name, disk);
    addInventoryLookupEntry(lookup, disk.device_path, disk);
    addInventoryLookupEntry(lookup, disk.wwn, disk);
    addInventoryLookupEntry(lookup, disk.wwid, disk);

    disk.partitions?.forEach((partition) => {
      addInventoryLookupEntry(lookup, partition.name, disk);
      addInventoryLookupEntry(lookup, partition.path, disk);
    });
  });

  return lookup;
};

const resolveDiskDetailFromInventory = (
  diskName: string,
  device: ZpoolDeviceEntry,
  inventoryLookup: Map<string, DiskInventoryItem>
) => {
  const candidates = [
    diskName,
    device.disk_name,
    device.full_disk_name,
    device.full_path_name,
    device.wwn,
    device.full_disk_wwn,
    device.full_path_wwn,
  ];

  for (const candidate of candidates) {
    const key = normalizeLookupKey(candidate);

    if (!key) {
      continue;
    }

    const matched = inventoryLookup.get(key);

    if (matched) {
      return matched;
    }
  }

  return null;
};

const normalizeDiskName = (device: ZpoolDeviceEntry) => {
  const candidates = [
    device.disk_name,
    device.full_disk_name,
    device.full_path_name,
  ];

  for (const candidate of candidates) {
    const normalized = String(candidate ?? '')
      .replace(/^\/dev\//, '')
      .trim();
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

const createAbortError = () => {
  const error = new Error('Pool device slot request was aborted.');
  error.name = 'AbortError';
  return error;
};

const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw createAbortError();
  }
};

const fetchPoolDevices = async (poolName: string, signal?: AbortSignal) => {
  throwIfAborted(signal);

  const endpoint = `/api/zpool/${encodeURIComponent(poolName)}/devices/`;
  const { data } = await axiosInstance.get<ZpoolDeviceResponse>(endpoint, {
    signal,
  });

  throwIfAborted(signal);

  if (data.ok === false) {
    throw new Error(
      normalizeErrorMessage(data.error, DEFAULT_POOL_DEVICE_ERROR_MESSAGE)
    );
  }

  return Array.isArray(data.data) ? data.data : [];
};

const buildPoolSlotEntry = (
  device: ZpoolDeviceEntry,
  inventoryLookup: Map<string, DiskInventoryItem>,
  signal?: AbortSignal
): PoolDiskSlot | null => {
  throwIfAborted(signal);

  const diskName = normalizeDiskName(device);

  if (!diskName) {
    return null;
  }

  const detail = resolveDiskDetailFromInventory(
    diskName,
    device,
    inventoryLookup
  );

  const wwn =
    normalizeWwn(detail?.wwn) ||
    normalizeWwn(detail?.wwid) ||
    normalizeWwn(device.full_disk_wwn) ||
    normalizeWwn(device.wwn) ||
    normalizeWwn(device.full_path_wwn);

  const path = normalizeDevicePath(device, detail, diskName);

  return {
    diskName,
    slotNumber: detail?.slot_number ?? null,
    wwn,
    path,
    detail,
  };
};

const fetchPoolDeviceSlots = async (
  poolNames: string[],
  signal?: AbortSignal
): Promise<PoolDeviceSlotsResult> => {
  const uniquePoolNames = Array.from(
    new Set(poolNames.map((pool) => pool.trim()).filter(Boolean))
  );

  if (uniquePoolNames.length === 0) {
    return { slotsByPool: {}, errorsByPool: {} };
  }

  throwIfAborted(signal);

  const inventory = await fetchDiskInventory({ signal });
  const inventoryLookup = buildDiskInventoryLookup(inventory);

  const slotsByPool: PoolSlotMap = {};
  const errorsByPool: Record<string, string> = {};

  await Promise.all(
    uniquePoolNames.map(async (poolName) => {
      try {
        throwIfAborted(signal);

        const devices = await fetchPoolDevices(poolName, signal);
        const diskDevices = devices.filter(
          (device) => !device.type || device.type?.toLowerCase() === 'disk'
        );

        slotsByPool[poolName] = diskDevices
          .map((device) => buildPoolSlotEntry(device, inventoryLookup, signal))
          .filter((slot): slot is PoolDiskSlot => Boolean(slot));
      } catch (error) {
        if (signal?.aborted) {
          throw error;
        }

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
    queryKey: ['zpool', 'devices', 'slots', poolNames.join(',')],
    queryFn: ({ signal }) => fetchPoolDeviceSlots(poolNames, signal),
    enabled: (options?.enabled ?? true) && poolNames.length > 0,
    refetchInterval: options?.refetchInterval ?? 30000,
    staleTime: 25000,
    gcTime: 2 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    meta: {
      skipGlobalLoader: true,
    },
  });
