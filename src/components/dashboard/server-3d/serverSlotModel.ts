import type { DiskInventoryItem } from '../../../@types/disk';
import type { PoolDiskSlot, PoolSlotMap } from '../../../hooks/usePoolDeviceSlots';

export const DEFAULT_SERVER_SLOT_COUNT = 4;

export type ServerSlotHealth =
  | 'empty'
  | 'free'
  | 'online'
  | 'inactive'
  | 'warning'
  | 'error'
  | 'unknown';

export interface ServerSlotViewModel {
  id: string;
  slotNumber: number;
  poolName: string | null;
  disk: PoolDiskSlot | null;
  health: ServerSlotHealth;
  isOccupied: boolean;
}

const parseSlotNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  const normalized = String(value ?? '').trim();

  if (!normalized) {
    return null;
  }

  const directNumber = Number(normalized);
  if (Number.isFinite(directNumber)) {
    return Math.trunc(directNumber);
  }

  const match = normalized.match(/\d+/);
  if (!match) {
    return null;
  }

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
};

const normalizeDiskState = (value: unknown) =>
  String(value ?? '').trim().toLowerCase();

const hasNoPartition = (slot: PoolDiskSlot) => slot.detail?.has_partition === false;

export const resolveServerSlotHealth = (
  slot: PoolDiskSlot | null
): ServerSlotHealth => {
  if (!slot) {
    return 'empty';
  }

  if (hasNoPartition(slot)) {
    return 'free';
  }

  const state = normalizeDiskState(slot.detail?.state);

  if (
    state.includes('fault') ||
    state.includes('fail') ||
    state.includes('offline') ||
    state.includes('unavail') ||
    state.includes('error') ||
    state.includes('bad') ||
    state.includes('خراب') ||
    state.includes('ناموفق')
  ) {
    return 'error';
  }

  if (
    state.includes('degrad') ||
    state.includes('warn') ||
    state.includes('repair') ||
    state.includes('resilver') ||
    state.includes('هشدار') ||
    state.includes('تعمیر')
  ) {
    return 'warning';
  }

  if (
    state === 'active' ||
    state === 'online' ||
    state === 'ok' ||
    state === 'running' ||
    state === 'فعال'
  ) {
    return 'online';
  }

  if (!state || state.includes('unknown') || state.includes('نامشخص')) {
    return 'unknown';
  }

  return 'inactive';
};

const flattenPoolSlots = (slotMap?: PoolSlotMap) => {
  const rows: Array<{ poolName: string | null; slot: PoolDiskSlot }> = [];

  Object.entries(slotMap ?? {}).forEach(([poolName, slots]) => {
    slots.forEach((slot) => {
      rows.push({ poolName, slot });
    });
  });

  return rows;
};

const getDiskIdentity = (slot: PoolDiskSlot) => {
  const candidates = [slot.diskName, slot.wwn, slot.path];

  for (const candidate of candidates) {
    const normalized = String(candidate ?? '')
      .replace(/^\/dev\//, '')
      .trim();

    if (normalized) {
      return normalized;
    }
  }

  return null;
};

const getInventoryIdentity = (disk: DiskInventoryItem) => {
  const candidates = [disk.disk, disk.wwn, disk.wwid, disk.device_path];

  for (const candidate of candidates) {
    const normalized = String(candidate ?? '')
      .replace(/^\/dev\//, '')
      .trim();

    if (normalized) {
      return normalized;
    }
  }

  return null;
};

const createInventorySlot = (disk: DiskInventoryItem): PoolDiskSlot | null => {
  const diskName = String(disk.disk ?? '')
    .replace(/^\/dev\//, '')
    .trim();

  if (!diskName) {
    return null;
  }

  const devicePath =
    typeof disk.device_path === 'string' && disk.device_path.trim().length > 0
      ? disk.device_path.trim()
      : `/dev/${diskName}`;

  return {
    diskName,
    slotNumber: disk.slot_number ?? null,
    wwn: disk.wwn ?? disk.wwid ?? null,
    path: devicePath,
    detail: disk,
  };
};

const buildAllDiskRows = (
  slotMap?: PoolSlotMap,
  inventory: DiskInventoryItem[] = []
) => {
  const rows = flattenPoolSlots(slotMap);
  const seenDiskIds = new Set<string>();

  rows.forEach(({ slot }) => {
    const diskKey = getDiskIdentity(slot);
    if (diskKey) {
      seenDiskIds.add(diskKey);
    }
  });

  inventory.forEach((disk) => {
    const diskKey = getInventoryIdentity(disk);

    if (!diskKey || seenDiskIds.has(diskKey)) {
      return;
    }

    const inventorySlot = createInventorySlot(disk);

    if (!inventorySlot) {
      return;
    }

    rows.push({ poolName: null, slot: inventorySlot });
    seenDiskIds.add(diskKey);
  });

  return rows;
};

export const resolveServerSlotCount = (
  slotMap?: PoolSlotMap,
  inventory: DiskInventoryItem[] = []
) => {
  let maxSlotNumber = 0;
  const seenDisks = new Set<string>();

  buildAllDiskRows(slotMap, inventory).forEach(({ slot }) => {
    const diskKey = getDiskIdentity(slot);

    if (diskKey) {
      seenDisks.add(diskKey);
    }

    const parsedSlotNumber = parseSlotNumber(slot.slotNumber);
    if (parsedSlotNumber != null && parsedSlotNumber > maxSlotNumber) {
      maxSlotNumber = parsedSlotNumber;
    }
  });

  return Math.max(DEFAULT_SERVER_SLOT_COUNT, maxSlotNumber, seenDisks.size);
};

export const buildServerSlots = (
  slotMap?: PoolSlotMap,
  inventory: DiskInventoryItem[] = [],
  slotCount = resolveServerSlotCount(slotMap, inventory)
): ServerSlotViewModel[] => {
  const bySlotNumber = new Map<number, { poolName: string | null; slot: PoolDiskSlot }>();
  const unplacedSlots: Array<{ poolName: string | null; slot: PoolDiskSlot }> = [];
  const seenDisks = new Set<string>();

  buildAllDiskRows(slotMap, inventory).forEach((entry) => {
    const diskKey = getDiskIdentity(entry.slot);

    if (!diskKey || seenDisks.has(diskKey)) {
      return;
    }

    seenDisks.add(diskKey);

    const parsedSlotNumber = parseSlotNumber(entry.slot.slotNumber);

    if (
      parsedSlotNumber != null &&
      parsedSlotNumber >= 1 &&
      parsedSlotNumber <= slotCount &&
      !bySlotNumber.has(parsedSlotNumber)
    ) {
      bySlotNumber.set(parsedSlotNumber, entry);
      return;
    }

    unplacedSlots.push(entry);
  });

  const slots: ServerSlotViewModel[] = Array.from(
    { length: slotCount },
    (_, index) => {
      const slotNumber = index + 1;
      const entry = bySlotNumber.get(slotNumber) ?? null;

      return {
        id: `server-slot-${slotNumber}`,
        slotNumber,
        poolName: entry?.poolName ?? null,
        disk: entry?.slot ?? null,
        health: resolveServerSlotHealth(entry?.slot ?? null),
        isOccupied: Boolean(entry?.slot),
      };
    }
  );

  unplacedSlots.forEach((entry) => {
    const emptyIndex = slots.findIndex((slot) => !slot.disk);

    if (emptyIndex < 0) {
      return;
    }

    slots[emptyIndex] = {
      id: `server-slot-${slots[emptyIndex].slotNumber}`,
      slotNumber: slots[emptyIndex].slotNumber,
      poolName: entry.poolName,
      disk: entry.slot,
      health: resolveServerSlotHealth(entry.slot),
      isOccupied: true,
    };
  });

  return slots;
};

export const sortServerSlots = (slots: ServerSlotViewModel[]) =>
  [...slots].sort((a, b) => a.slotNumber - b.slotNumber);
