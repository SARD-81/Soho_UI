import type { DiskDevice, DiskIOStats, DiskResponse } from '../@types/disk';
import type { NetworkData, NetworkInterface } from '../hooks/useNetwork';
import type { MockState } from './mockState';

const clamp = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};

const randomInRange = (min: number, max: number) => {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return 0;
  }

  if (max <= min) {
    return min;
  }

  return Math.random() * (max - min) + min;
};

const randomIntInRange = (min: number, max: number) => {
  return Math.floor(randomInRange(min, max + 1));
};

const randomStep = (current: number, maxDelta: number, min: number, max: number) => {
  const safeCurrent = Number.isFinite(current) ? current : (min + max) / 2;
  const delta = randomInRange(-Math.abs(maxDelta), Math.abs(maxDelta));
  return clamp(safeCurrent + delta, min, max);
};

const roundTo = (value: number, precision = 2) => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

const updateCpuMetrics = (state: MockState) => {
  const cpuState = state.cpu ?? {};
  const percent = randomStep(cpuState.cpu_percent ?? 35, 8, 3, 98);

  const frequency = cpuState.cpu_frequency ?? {};
  const minFrequency = frequency.min ?? 1200;
  const maxFrequency = Math.max(frequency.max ?? 4200, minFrequency + 100);
  const currentFrequency = randomStep(
    frequency.current ?? (minFrequency + maxFrequency) / 2,
    (maxFrequency - minFrequency) * 0.15,
    minFrequency,
    maxFrequency
  );

  const nextCpuState = {
    cpu_percent: roundTo(percent, 1),
    cpu_frequency: {
      ...frequency,
      current: Math.round(currentFrequency),
      min: minFrequency,
      max: maxFrequency,
    },
    cpu_cores: cpuState.cpu_cores ?? { physical: 4, logical: 8 },
  };

  state.cpu = nextCpuState;
  return nextCpuState;
};

const updateMemoryMetrics = (state: MockState) => {
  const memoryState = state.memory ?? {};
  const total = memoryState.total && memoryState.total > 0
    ? memoryState.total
    : 16 * 1024 ** 3;

  const used = randomStep(
    memoryState.used ?? total * 0.35,
    total * 0.015,
    total * 0.2,
    total * 0.92
  );

  const availableCapacity = Math.max(total - used, 0);

  const free = clamp(
    randomStep(
      memoryState.free ?? availableCapacity * 0.6,
      total * 0.01,
      0,
      availableCapacity
    ),
    0,
    availableCapacity
  );

  let remaining = Math.max(availableCapacity - free, 0);

  const cached = clamp(
    randomStep(memoryState.cached ?? remaining * 0.55, total * 0.01, 0, remaining),
    0,
    remaining
  );
  remaining = Math.max(remaining - cached, 0);

  const buffers = clamp(
    randomStep(memoryState.buffers ?? remaining * 0.4, total * 0.005, 0, remaining),
    0,
    remaining
  );
  remaining = Math.max(remaining - buffers, 0);

  const shared = clamp(
    randomStep(memoryState.shared ?? remaining, total * 0.002, 0, remaining),
    0,
    remaining
  );

  const nextMemoryState = {
    total,
    used: Math.round(used),
    available: Math.round(free + cached + buffers + shared),
    free: Math.round(free),
    percent: roundTo((used / total) * 100, 1),
    cached: Math.round(cached),
    buffers: Math.round(buffers),
    shared: Math.round(shared),
  };

  state.memory = nextMemoryState;
  return nextMemoryState;
};

const updateNetworkMetrics = (state: MockState) => {
  const interfaces = state.network.interfaces;
  const nextInterfaces: Record<string, NetworkInterface> = {};

  Object.entries(interfaces).forEach(([name, iface]) => {
    const bandwidth = iface.bandwidth ?? { download: 0, upload: 0, unit: 'MB/s' };

    const download = randomStep(
      bandwidth.download ?? 0,
      Math.max(bandwidth.download ?? 0, 1) * 0.3 + 10,
      0,
      1024
    );
    const upload = randomStep(
      bandwidth.upload ?? 0,
      Math.max(bandwidth.upload ?? 0, 1) * 0.3 + 5,
      0,
      512
    );

    nextInterfaces[name] = {
      ...iface,
      bandwidth: {
        download: roundTo(download, 1),
        upload: roundTo(upload, 1),
        unit: bandwidth.unit ?? 'MB/s',
      },
      status: {
        ...iface.status,
        lastSampled: new Date().toISOString(),
      },
    };
  });

  const nextNetworkState: NetworkData = {
    interfaces: nextInterfaces,
  };

  state.network = nextNetworkState;
  return nextNetworkState;
};

const updateDiskMetrics = (state: MockState) => {
  const diskState = state.disk;

  const updatedDisks = diskState.disks.map<DiskDevice>((disk) => {
    const total = disk.usage.total;
    const percent = randomStep(
      disk.usage.percent ?? (disk.usage.used / Math.max(total, 1)) * 100,
      3,
      5,
      95
    );

    const used = clamp((percent / 100) * total, 0, total);
    const free = Math.max(total - used, 0);

    const readBytes = (disk.io.read_bytes ?? 0) + randomIntInRange(50_000, 4_000_000);
    const writeBytes = (disk.io.write_bytes ?? 0) + randomIntInRange(50_000, 4_000_000);
    const readCount = (disk.io.read_count ?? 0) + randomIntInRange(100, 1_200);
    const writeCount = (disk.io.write_count ?? 0) + randomIntInRange(100, 1_200);
    const readTime = (disk.io.read_time ?? 0) + randomIntInRange(50, 750);
    const writeTime = (disk.io.write_time ?? 0) + randomIntInRange(50, 750);
    const busyTime = (disk.io.busy_time ?? 0) + randomIntInRange(50, 750);

    return {
      ...disk,
      usage: {
        total,
        used: Math.round(used),
        free: Math.round(free),
        percent: roundTo((used / total) * 100, 1),
      },
      io: {
        ...disk.io,
        read_bytes: readBytes,
        write_bytes: writeBytes,
        read_count: readCount,
        write_count: writeCount,
        read_time: readTime,
        write_time: writeTime,
        busy_time: busyTime,
      },
    };
  });

  const diskIoSummary = updatedDisks.reduce<DiskResponse['summary']['disk_io_summary']>(
    (acc, disk) => {
      const io = disk.io as Partial<DiskIOStats>;
      acc[disk.device] = {
        read_bytes: io.read_bytes,
        write_bytes: io.write_bytes,
        read_time: io.read_time,
        write_time: io.write_time,
        busy_time: io.busy_time,
      };
      return acc;
    },
    {}
  );

  const nextDiskState: DiskResponse = {
    disks: updatedDisks,
    summary: {
      total_disks: updatedDisks.length,
      disk_io_summary: diskIoSummary,
    },
  };

  state.disk = nextDiskState;
  return nextDiskState;
};

export const generateDashboardSnapshot = (state: MockState) => ({
  cpu: updateCpuMetrics(state),
  memory: updateMemoryMetrics(state),
  network: updateNetworkMetrics(state),
  disk: updateDiskMetrics(state),
});

export const generateCpuMetrics = updateCpuMetrics;
export const generateMemoryMetrics = updateMemoryMetrics;
export const generateNetworkMetrics = updateNetworkMetrics;
export const generateDiskMetrics = updateDiskMetrics;