import type { DiskDevice, DiskResponse } from '../@types/disk';
import type { MockState } from './mockState';

const clamp = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const randomWalk = (
  current: number,
  min: number,
  max: number,
  maxDelta: number
) => {
  const base = Number.isFinite(current) ? current : min;
  const delta = randomBetween(-maxDelta, maxDelta);
  const next = base + delta;

  return clamp(next, min, max);
};

const randomWalkFixed = (
  current: number,
  min: number,
  max: number,
  maxDelta: number,
  fractionDigits: number
) => {
  const next = randomWalk(current, min, max, maxDelta);
  return Number(next.toFixed(fractionDigits));
};

const randomWalkInt = (current: number, min: number, max: number, maxDelta: number) => {
  const next = randomWalk(current, min, max, maxDelta);
  return Math.round(next);
};

const incrementCounter = (current: number, minDelta: number, maxDelta: number) => {
  const safeCurrent = Number.isFinite(current) ? current : 0;
  const delta = randomBetween(minDelta, maxDelta);
  return Math.max(0, Math.round(safeCurrent + delta));
};

const SPEED_UNIT_TO_MBPS: Record<string, number> = {
  bps: 1 / 8_000_000,
  kbps: 1 / 8_000,
  mbps: 1 / 8,
  gbps: 125,
  tbps: 125_000,
  'mb/s': 1,
  'gb/s': 1_000,
};

const parseSpeedToMBps = (raw: unknown) => {
  if (raw == null) {
    return 125;
  }

  if (typeof raw === 'number') {
    return raw;
  }

  const text = String(raw).trim().toLowerCase();
  const match = text.match(/([\d.]+)/);
  const numeric = match ? Number(match[1]) : Number(text);

  if (!Number.isFinite(numeric)) {
    return 125;
  }

  const unitEntry = Object.entries(SPEED_UNIT_TO_MBPS).find(([unit]) =>
    text.includes(unit)
  );

  if (!unitEntry) {
    return numeric;
  }

  const [, ratio] = unitEntry;
  return numeric * ratio;
};

const parseCapacityValue = (value: string | undefined) => {
  if (!value) {
    return null;
  }

  const match = String(value)
    .trim()
    .match(/^([\d.]+)\s*([a-zA-Z]+)$/);

  if (!match) {
    return null;
  }

  const numeric = Number(match[1]);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  const unit = match[2];
  return { numeric, unit } as const;
};

const formatCapacityValue = (numeric: number, unit: string, fractionDigits = 1) => {
  const rounded = Number(numeric.toFixed(fractionDigits));
  return `${rounded} ${unit}`;
};

export const updateCpuMetrics = (state: MockState) => {
  const cpuState = state.cpu;
  const percent = randomWalkFixed(cpuState.cpu_percent ?? 20, 3, 97, 10, 1);
  const minFrequency = cpuState.cpu_frequency?.min ?? 1200;
  const maxFrequency = cpuState.cpu_frequency?.max ?? 3800;
  const currentFrequency = randomWalkInt(
    cpuState.cpu_frequency?.current ?? (minFrequency + maxFrequency) / 2,
    minFrequency,
    maxFrequency,
    Math.max((maxFrequency - minFrequency) * 0.2, 150)
  );

  state.cpu = {
    ...cpuState,
    cpu_percent: percent,
    cpu_frequency: {
      min: minFrequency,
      max: maxFrequency,
      current: currentFrequency,
    },
  };

  return state.cpu;
};

export const updateMemoryMetrics = (state: MockState) => {
  const memoryState = state.memory;
  const total = Number(memoryState.total ?? 16 * 1024 ** 3);
  const used = randomWalkInt(
    memoryState.used ?? total * 0.35,
    total * 0.18,
    total * 0.92,
    total * 0.035
  );
  const available = Math.max(total - used, 0);
  const cached = randomWalkInt(
    memoryState.cached ?? total * 0.12,
    total * 0.05,
    total * 0.25,
    total * 0.02
  );
  const buffers = randomWalkInt(
    memoryState.buffers ?? total * 0.03,
    total * 0.01,
    total * 0.08,
    total * 0.01
  );
  const free = randomWalkInt(
    Math.min(memoryState.free ?? available * 0.6, available),
    Math.max(available * 0.1, 0),
    Math.max(available, 0),
    Math.max(available * 0.15, 1)
  );

  const percent = total > 0 ? Number(((used / total) * 100).toFixed(1)) : 0;

  state.memory = {
    ...memoryState,
    total,
    used,
    available,
    free: Math.min(free, available),
    cached,
    buffers,
    percent,
  };

  return state.memory;
};

const updateDiskDevice = (device: DiskDevice): DiskDevice => {
  const total = device.usage.total;
  const used = randomWalkInt(device.usage.used, total * 0.25, total * 0.95, total * 0.03);
  const free = Math.max(total - used, 0);
  const percent = total > 0 ? Number(((used / total) * 100).toFixed(1)) : device.usage.percent;

  const bytesBase = Math.max(total * 0.00001, 5 * 1024 ** 2);
  const readBytes = incrementCounter(device.io.read_bytes ?? 0, bytesBase, bytesBase * 8);
  const writeBytes = incrementCounter(device.io.write_bytes ?? 0, bytesBase, bytesBase * 10);
  const sizeInGb = total / 1024 ** 3;
  const countBase = Math.max(60, Math.round(sizeInGb * 8));
  const readCount = incrementCounter(device.io.read_count ?? 0, countBase, countBase * 20);
  const writeCount = incrementCounter(device.io.write_count ?? 0, countBase, countBase * 22);
  const timeBase = Math.max(6, Math.round(sizeInGb * 1.5));
  const readTime = incrementCounter(device.io.read_time ?? 0, timeBase, timeBase * 80);
  const writeTime = incrementCounter(device.io.write_time ?? 0, timeBase, timeBase * 90);
  const busyBase = Math.max(10, Math.round(sizeInGb * 2));
  const busyTime = incrementCounter(device.io.busy_time ?? 0, busyBase, busyBase * 120);

  return {
    ...device,
    usage: {
      total,
      used,
      free,
      percent,
    },
    io: {
      ...device.io,
      read_bytes: readBytes,
      write_bytes: writeBytes,
      read_count: readCount,
      write_count: writeCount,
      read_time: readTime,
      write_time: writeTime,
      busy_time: busyTime,
    },
  };
};

export const updateDiskMetrics = (state: MockState) => {
  const updatedDisks = state.disk.disks.map(updateDiskDevice);
  const disk_io_summary: DiskResponse['summary']['disk_io_summary'] = {};

  updatedDisks.forEach((disk) => {
    disk_io_summary[disk.device] = {
      read_bytes: disk.io.read_bytes,
      write_bytes: disk.io.write_bytes,
      read_time: disk.io.read_time,
      write_time: disk.io.write_time,
    };
  });

  state.disk = {
    ...state.disk,
    disks: updatedDisks,
    summary: {
      total_disks: updatedDisks.length,
      disk_io_summary,
    },
  };

  return state.disk;
};

export const updateNetworkMetrics = (state: MockState) => {
  const interfacesEntries = Object.entries(state.network.interfaces);
  interfacesEntries.forEach(([name, networkInterface]) => {
    const unit = networkInterface.bandwidth.unit ?? 'MB/s';
    const maxFromSpeed = parseSpeedToMBps(networkInterface.status?.speed);
    const unitLower = unit.toLowerCase();
    const unitFactor = unitLower.includes('mb') ? 1 : unitLower.includes('kb') ? 1 / 1024 : 1;
    const maxBandwidth = Math.max(maxFromSpeed * unitFactor, 10);

    const download = randomWalkFixed(
      networkInterface.bandwidth.download,
      0,
      maxBandwidth,
      Math.max(maxBandwidth * 0.3, 2),
      1
    );
    const upload = randomWalkFixed(
      networkInterface.bandwidth.upload,
      0,
      maxBandwidth * 0.8,
      Math.max(maxBandwidth * 0.25, 1.5),
      1
    );

    state.network.interfaces[name] = {
      ...networkInterface,
      bandwidth: {
        ...networkInterface.bandwidth,
        download,
        upload,
      },
    };
  });

  return state.network;
};

export const updateZpoolMetrics = (state: MockState) => {
  state.zpool.capacities = state.zpool.capacities.map((pool) => {
    const sizeInfo = parseCapacityValue(pool.size);
    if (!sizeInfo) {
      return pool;
    }

    const allocInfo = parseCapacityValue(pool.alloc) ?? {
      numeric: sizeInfo.numeric * 0.3,
      unit: sizeInfo.unit,
    };

    const used = randomWalkFixed(
      allocInfo.numeric,
      sizeInfo.numeric * 0.15,
      sizeInfo.numeric * 0.92,
      sizeInfo.numeric * 0.12,
      2
    );
    const free = Math.max(sizeInfo.numeric - used, 0);
    const capacityPercent = sizeInfo.numeric > 0 ? Math.round((used / sizeInfo.numeric) * 100) : 0;

    const updatedPool = {
      ...pool,
      alloc: formatCapacityValue(used, sizeInfo.unit, used < 10 ? 2 : 1),
      free: formatCapacityValue(free, sizeInfo.unit, free < 10 ? 2 : 1),
      capacity: `${capacityPercent}%`,
    };

    const details = state.zpool.details[pool.name];
    if (Array.isArray(details) && details.length > 0) {
      const [first, ...rest] = details;
      state.zpool.details[pool.name] = [
        {
          ...first,
          size: updatedPool.size,
          alloc: updatedPool.alloc,
          free: updatedPool.free,
          capacity: updatedPool.capacity,
        },
        ...rest,
      ];
    }

    return updatedPool;
  });

  return state.zpool;
};
