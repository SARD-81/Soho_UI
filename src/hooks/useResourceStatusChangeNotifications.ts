import { useCallback, useEffect, useRef, useState } from 'react';
import type { DiskDevice } from '../@types/disk';
import type { ServiceEntry } from '../@types/service';
import type { ZpoolCapacityEntry } from '../@types/zpool';
import { getServiceLabel } from '../constants/serviceLabels';
import {
  cleanupExpiredNotifications,
  upsertNotification,
} from '../utils/notificationStorage';
import {
  createResourceStatusChangeNotification,
  normalizeResourceStatus,
  type ResourceStatusSnapshotItem,
} from '../utils/notificationStatusRules';
import {
  loadResourceStatusSnapshot,
  saveResourceStatusSnapshot,
} from '../utils/resourceStatusSnapshotStorage';
import { getServiceRuntimeSnapshotStatus } from '../utils/serviceRuntime';
import { useDisk } from './useDisk';
import { useServices } from './useServices';
import { useZpool } from './useZpool';

const POOL_STATUS_FIELDS = ['health', 'status', 'state', 'وضعیت'] as const;
const DISK_NAME_DETAIL_FIELDS = ['disk', 'name', 'device_path'] as const;
const DISK_STATUS_FIELDS = ['state', 'status', 'health', 'وضعیت'] as const;

const isBrowser = () => typeof window !== 'undefined';

const getRecordValue = (
  record: Record<string, unknown> | undefined,
  keys: readonly string[]
) => {
  if (record == null) {
    return undefined;
  }

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      return record[key];
    }
  }

  return undefined;
};

const normalizeName = (value: unknown) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

const resolvePoolStatus = (pool: ZpoolCapacityEntry) =>
  normalizeResourceStatus(pool.health) ??
  normalizeResourceStatus(getRecordValue(pool.raw, POOL_STATUS_FIELDS));

const createPoolSnapshotItem = (
  pool: ZpoolCapacityEntry
): ResourceStatusSnapshotItem | null => {
  const entityName = normalizeName(pool.name);
  const status = resolvePoolStatus(pool);

  if (entityName == null || status == null) {
    return null;
  }

  return {
    entityType: 'pool',
    entityId: entityName,
    entityName,
    status,
  };
};

const resolveDiskName = (disk: DiskDevice, index: number) =>
  normalizeName(disk.device) ??
  normalizeName(getRecordValue(disk.details, DISK_NAME_DETAIL_FIELDS)) ??
  `Disk #${index + 1}`;

const resolveDiskStatus = (disk: DiskDevice) =>
  normalizeResourceStatus(getRecordValue(disk.details, DISK_STATUS_FIELDS)) ??
  normalizeResourceStatus(
    getRecordValue(
      disk as unknown as Record<string, unknown>,
      DISK_STATUS_FIELDS
    )
  );

const createDiskSnapshotItem = (
  disk: DiskDevice,
  index: number
): ResourceStatusSnapshotItem | null => {
  const entityName = resolveDiskName(disk, index);
  const status = resolveDiskStatus(disk);

  if (status == null) {
    return null;
  }

  const entityId =
    normalizeName(disk.details?.wwn) ??
    normalizeName(disk.details?.wwid) ??
    entityName;

  return {
    entityType: 'disk',
    entityId,
    entityName,
    status,
  };
};

const createServiceSnapshotItem = (
  service: ServiceEntry
): ResourceStatusSnapshotItem | null => {
  const entityId = normalizeName(service.unit);

  if (entityId == null) {
    return null;
  }

  return {
    entityType: 'service',
    entityId,
    entityName: getServiceLabel(entityId, service.description),
    status: getServiceRuntimeSnapshotStatus(service),
  };
};

const createSnapshotSignature = (
  items: ResourceStatusSnapshotItem[],
  userKey?: string
) =>
  JSON.stringify({
    userKey: userKey || 'default',
    items: items.map((item) => [
      item.entityType,
      item.entityId,
      item.entityName,
      item.status,
    ]),
  });

type ResourceStatusChangeNotificationsResult = {
  isChecking: boolean;
  lastCheckAt: string | null;
  error: Error | null;
};

export const useResourceStatusChangeNotifications = (
  userKey?: string
): ResourceStatusChangeNotificationsResult => {
  const zpoolQuery = useZpool();
  const diskQuery = useDisk();
  const servicesQuery = useServices();
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckAt, setLastCheckAt] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const checkedDataSignatureRef = useRef<string | null>(null);

  const buildCurrentSnapshot = useCallback(() => {
    const pools = Array.isArray(zpoolQuery.data?.pools)
      ? zpoolQuery.data.pools
      : [];
    const disks = Array.isArray(diskQuery.data?.disks)
      ? diskQuery.data.disks
      : [];
    const services = Array.isArray(servicesQuery.data?.data)
      ? servicesQuery.data.data
      : [];

    const poolItems = pools
      .map(createPoolSnapshotItem)
      .filter((item): item is ResourceStatusSnapshotItem => item != null);
    const diskItems = disks
      .map(createDiskSnapshotItem)
      .filter((item): item is ResourceStatusSnapshotItem => item != null);
    const serviceItems = services
      .map(createServiceSnapshotItem)
      .filter((item): item is ResourceStatusSnapshotItem => item != null);

    return [...poolItems, ...diskItems, ...serviceItems];
  }, [diskQuery.data, servicesQuery.data, zpoolQuery.data]);

  const runStatusChangeChecks = useCallback(() => {
    if (!isBrowser()) {
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const currentSnapshotItems = buildCurrentSnapshot();
      const previousSnapshot = loadResourceStatusSnapshot(userKey);

      if (previousSnapshot == null) {
        saveResourceStatusSnapshot(currentSnapshotItems, userKey);
        setLastCheckAt(new Date().toISOString());
        return;
      }

      const previousItemByKey = new Map(
        previousSnapshot.items.map((item) => [
          `${item.entityType}:${item.entityId}`,
          item,
        ])
      );

      cleanupExpiredNotifications(userKey);
      let generatedCount = 0;

      currentSnapshotItems.forEach((currentItem) => {
        const previousItem = previousItemByKey.get(
          `${currentItem.entityType}:${currentItem.entityId}`
        );

        if (
          previousItem == null ||
          previousItem.status === currentItem.status
        ) {
          return;
        }

        upsertNotification(
          createResourceStatusChangeNotification({
            entityType: currentItem.entityType,
            entityId: currentItem.entityId,
            entityName: currentItem.entityName,
            previousStatus: previousItem.status,
            currentStatus: currentItem.status,
          }),
          userKey
        );
        generatedCount += 1;
      });

      saveResourceStatusSnapshot(currentSnapshotItems, userKey);
      setLastCheckAt(new Date().toISOString());

      if (generatedCount > 0) {
        window.dispatchEvent(
          new CustomEvent('soho:notifications:status-change-summary', {
            detail: {
              count: generatedCount,
              message: 'چند تغییر وضعیت در منابع سامانه شناسایی شد.',
            },
          })
        );
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError
          : new Error('Resource status notification check failed')
      );
    } finally {
      setIsChecking(false);
    }
  }, [buildCurrentSnapshot, userKey]);

  useEffect(() => {
    if (
      !zpoolQuery.isSuccess ||
      !diskQuery.isSuccess ||
      !servicesQuery.isSuccess ||
      zpoolQuery.data == null ||
      diskQuery.data == null ||
      servicesQuery.data == null
    ) {
      return;
    }

    const currentSnapshotItems = buildCurrentSnapshot();
    const dataSignature = createSnapshotSignature(
      currentSnapshotItems,
      userKey
    );

    if (checkedDataSignatureRef.current === dataSignature) {
      return;
    }

    checkedDataSignatureRef.current = dataSignature;
    runStatusChangeChecks();
  }, [
    buildCurrentSnapshot,
    diskQuery.data,
    diskQuery.isSuccess,
    runStatusChangeChecks,
    servicesQuery.data,
    servicesQuery.isSuccess,
    userKey,
    zpoolQuery.data,
    zpoolQuery.isSuccess,
  ]);

  return { isChecking, lastCheckAt, error };
};
