import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FileSystemEntry } from '../@types/filesystem';
import type { ZpoolCapacityEntry } from '../@types/zpool';
import { cleanupExpiredNotifications, upsertNotification } from '../utils/notificationStorage';
import {
  createFilesystemCapacityNotification,
  createPoolCapacityNotification,
  normalizePercentValue,
} from '../utils/notificationCapacityRules';
import { useFileSystems } from './useFileSystems';
import { useZpool } from './useZpool';

export const CHECK_INTERVAL_MS = 30 * 60 * 1000;

const LAST_CAPACITY_CHECK_KEY_PREFIX = 'soho:notifications:last-capacity-check';
const PERCENT_FIELD_NAMES = ['used_percent', 'usage_percent', 'capacity', 'usedPercent', 'percent'] as const;
const POOL_PERCENT_FIELD_NAMES = ['capacity', 'cap', ...PERCENT_FIELD_NAMES] as const;
const USED_FIELD_NAMES = ['used', 'usedBytes', 'used_bytes', 'used_capacity', 'capacity_used'] as const;
const TOTAL_FIELD_NAMES = ['total', 'totalBytes', 'total_bytes', 'quota', 'referenced_quota', 'capacity_total'] as const;
const AVAILABLE_FIELD_NAMES = ['available', 'avail', 'free', 'freeBytes', 'free_bytes', 'capacity_free'] as const;

type StartupNotificationChecksResult = {
  isChecking: boolean;
  lastCheckAt: string | null;
  error: Error | null;
};

const isBrowser = () => typeof window !== 'undefined';

const createLastCheckStorageKey = (userKey?: string) =>
  `${LAST_CAPACITY_CHECK_KEY_PREFIX}:${userKey || 'default'}`;

const getRecordValue = (record: Record<string, unknown>, keys: readonly string[]) => {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      return record[key];
    }
  }

  return undefined;
};

const normalizeByteValue = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length === 0 || trimmedValue === '-') {
    return null;
  }

  const numericValue = Number(trimmedValue.replace(/,/g, '.'));
  if (Number.isFinite(numericValue)) {
    return numericValue;
  }

  const match = trimmedValue.replace(/,/g, '.').match(/^(-?\d+(?:\.\d+)?)\s*([KMGTPE]?i?B?)?$/i);
  if (!match) {
    return null;
  }

  const baseValue = Number(match[1]);
  if (!Number.isFinite(baseValue)) {
    return null;
  }

  const unit = (match[2] || 'B').toLowerCase();
  const multiplierByUnit: Record<string, number> = {
    b: 1,
    k: 1024,
    kb: 1024,
    kib: 1024,
    m: 1024 ** 2,
    mb: 1024 ** 2,
    mib: 1024 ** 2,
    g: 1024 ** 3,
    gb: 1024 ** 3,
    gib: 1024 ** 3,
    t: 1024 ** 4,
    tb: 1024 ** 4,
    tib: 1024 ** 4,
    p: 1024 ** 5,
    pb: 1024 ** 5,
    pib: 1024 ** 5,
    e: 1024 ** 6,
    eb: 1024 ** 6,
    eib: 1024 ** 6,
  };

  return multiplierByUnit[unit] != null ? baseValue * multiplierByUnit[unit] : null;
};

const resolvePoolPercent = (pool: ZpoolCapacityEntry) => {
  const normalizedPercent = normalizePercentValue(pool.capacityPercent);
  if (normalizedPercent != null) {
    return normalizedPercent;
  }

  return normalizePercentValue(getRecordValue(pool.raw, POOL_PERCENT_FIELD_NAMES));
};

const resolveFilesystemPercent = (filesystem: FileSystemEntry) => {
  const rawPercent = normalizePercentValue(getRecordValue(filesystem.raw, PERCENT_FIELD_NAMES));
  if (rawPercent != null) {
    return rawPercent;
  }

  const attributePercent = normalizePercentValue(getRecordValue(filesystem.attributeMap, PERCENT_FIELD_NAMES));
  if (attributePercent != null) {
    return attributePercent;
  }

  const usedBytes = normalizeByteValue(getRecordValue(filesystem.raw, USED_FIELD_NAMES));
  const totalBytes = normalizeByteValue(getRecordValue(filesystem.raw, TOTAL_FIELD_NAMES));
  const availableBytes = normalizeByteValue(getRecordValue(filesystem.raw, AVAILABLE_FIELD_NAMES));
  const calculatedTotalBytes = totalBytes ?? (usedBytes != null && availableBytes != null ? usedBytes + availableBytes : null);

  if (usedBytes != null && calculatedTotalBytes != null && calculatedTotalBytes > 0) {
    return (usedBytes / calculatedTotalBytes) * 100;
  }

  return null;
};

export const useStartupNotificationChecks = (userKey?: string): StartupNotificationChecksResult => {
  const zpoolQuery = useZpool({ refetchInterval: 0 });
  const fileSystemsQuery = useFileSystems();
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckAt, setLastCheckAt] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const checkedDataSignatureRef = useRef<string | null>(null);

  const storageKey = useMemo(() => createLastCheckStorageKey(userKey), [userKey]);
  const isDataReady = zpoolQuery.isSuccess && fileSystemsQuery.isSuccess;

  const runCapacityChecks = useCallback(() => {
    if (!isBrowser()) {
      return;
    }

    const now = Date.now();
    const lastCheckValue = window.localStorage.getItem(storageKey);
    const lastCheckTime = lastCheckValue == null ? null : Number(lastCheckValue);

    if (lastCheckTime != null && Number.isFinite(lastCheckTime) && now - lastCheckTime < CHECK_INTERVAL_MS) {
      setLastCheckAt(new Date(lastCheckTime).toISOString());
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const poolData = zpoolQuery.data;
      const filesystemData = fileSystemsQuery.data;

      if (poolData == null || filesystemData == null) {
        return;
      }

      cleanupExpiredNotifications(userKey);
      let generatedCount = 0;

      poolData.pools.forEach((pool) => {
        const percent = resolvePoolPercent(pool);
        const notification = percent == null ? null : createPoolCapacityNotification(pool.name, percent);

        if (notification != null) {
          upsertNotification(notification, userKey);
          generatedCount += 1;
        }
      });

      filesystemData.filesystems.forEach((filesystem) => {
        const percent = resolveFilesystemPercent(filesystem);
        const notification = percent == null
          ? null
          : createFilesystemCapacityNotification(filesystem.poolName, filesystem.filesystemName, percent);

        if (notification != null) {
          upsertNotification(notification, userKey);
          generatedCount += 1;
        }
      });

      const checkedAt = new Date(now).toISOString();
      window.localStorage.setItem(storageKey, String(now));
      setLastCheckAt(checkedAt);

      if (generatedCount > 0) {
        window.dispatchEvent(
          new CustomEvent('soho:notifications:capacity-summary', {
            detail: { message: 'چند هشدار ظرفیت در سامانه شناسایی شد.', count: generatedCount },
          }),
        );
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError : new Error('Capacity notification check failed'));
    } finally {
      setIsChecking(false);
    }
  }, [fileSystemsQuery.data, storageKey, userKey, zpoolQuery.data]);

  useEffect(() => {
    if (!isDataReady || zpoolQuery.data == null || fileSystemsQuery.data == null) {
      return;
    }

    const dataSignature = JSON.stringify({
      pools: zpoolQuery.data.pools.map((pool) => [pool.name, resolvePoolPercent(pool)]),
      filesystems: fileSystemsQuery.data.filesystems.map((filesystem) => [
        filesystem.fullName,
        resolveFilesystemPercent(filesystem),
      ]),
    });

    if (checkedDataSignatureRef.current === dataSignature) {
      return;
    }

    checkedDataSignatureRef.current = dataSignature;
    runCapacityChecks();
  }, [fileSystemsQuery.data, isDataReady, runCapacityChecks, zpoolQuery.data]);

  return {
    isChecking,
    lastCheckAt,
    error,
  };
};
