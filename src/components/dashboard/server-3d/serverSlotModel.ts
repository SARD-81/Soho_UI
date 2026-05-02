import type { PoolDiskSlot, PoolSlotMap } from '../../../hooks/usePoolDeviceSlots';

export const DEFAULT_SERVER_SLOT_COUNT = 4;

export type ServerSlotHealth =
  | 'empty'
  | 'online'
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

export const resolveServerSlotHealth = (
  slot: PoolDiskSlot | null
): ServerSlotHealth => {
  if (!slot) {
    return 'empty';
  }

  const state = normalizeDiskState(slot.detail?.state);

  if (
    state.includes('fault') ||
    state.includes('fail') ||
    state.includes('offline') ||
    state.includes('unavail') ||
    state.includes('error') ||
    state.includes('bad')
  ) {
    return 'error';
  }

  if (
    state.includes('degrad') ||
    state.includes('warn') ||
    state.includes('unknown') ||
    state.includes('repair') ||
    state.includes('resilver')
  ) {
    return 'warning';
  }

  if (!state) {
    return 'unknown';
  }

  return 'online';
};

const flattenPoolSlots = (slotMap?: PoolSlotMap) => {
  const rows: Array<{ poolName: string; slot: PoolDiskSlot }> = [];

  Object.entries(slotMap ?? {}).forEach(([poolName, slots]) => {
    slots.forEach((slot) => {
      rows.push({ poolName, slot });
    });
  });

  return rows;
};

export const buildServerSlots = (
  slotMap?: PoolSlotMap,
  slotCount = DEFAULT_SERVER_SLOT_COUNT
): ServerSlotViewModel[] => {
  const bySlotNumber = new Map<number, { poolName: string; slot: PoolDiskSlot }>();
  const unplacedSlots: Array<{ poolName: string; slot: PoolDiskSlot }> = [];
  const seenDisks = new Set<string>();

  flattenPoolSlots(slotMap).forEach((entry) => {
    const diskKey = entry.slot.diskName?.trim();

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