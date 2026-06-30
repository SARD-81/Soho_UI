import type { ResourceStatusSnapshotItem } from './notificationStatusRules';

const RESOURCE_STATUS_SNAPSHOT_KEY_PREFIX = 'soho:notifications:resource-status-snapshot';

interface ResourceStatusSnapshotStorageValue {
  version: 1;
  updatedAt: string;
  items: ResourceStatusSnapshotItem[];
}

const isBrowser = () => typeof window !== 'undefined';

export const getResourceStatusSnapshotStorageKey = (userKey?: string) =>
  `${RESOURCE_STATUS_SNAPSHOT_KEY_PREFIX}:${userKey || 'default'}`;

const isValidSnapshotItem = (item: unknown): item is ResourceStatusSnapshotItem => {
  if (item == null || typeof item !== 'object') {
    return false;
  }

  const candidate = item as Partial<ResourceStatusSnapshotItem>;
  return (
    (candidate.entityType === 'pool' || candidate.entityType === 'disk') &&
    typeof candidate.entityId === 'string' &&
    candidate.entityId.trim().length > 0 &&
    typeof candidate.entityName === 'string' &&
    candidate.entityName.trim().length > 0 &&
    typeof candidate.status === 'string' &&
    candidate.status.trim().length > 0
  );
};

const isValidSnapshotValue = (value: unknown): value is ResourceStatusSnapshotStorageValue => {
  if (value == null || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ResourceStatusSnapshotStorageValue>;
  return (
    candidate.version === 1 &&
    typeof candidate.updatedAt === 'string' &&
    !Number.isNaN(new Date(candidate.updatedAt).getTime()) &&
    Array.isArray(candidate.items) &&
    candidate.items.every(isValidSnapshotItem)
  );
};

export const loadResourceStatusSnapshot = (
  userKey?: string,
): ResourceStatusSnapshotStorageValue | null => {
  if (!isBrowser()) {
    return null;
  }

  const storageKey = getResourceStatusSnapshotStorageKey(userKey);

  try {
    const storedValue = window.localStorage.getItem(storageKey);
    if (!storedValue) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(storedValue);
    if (!isValidSnapshotValue(parsedValue)) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    return parsedValue;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
};

export const saveResourceStatusSnapshot = (
  items: ResourceStatusSnapshotItem[],
  userKey?: string,
): ResourceStatusSnapshotStorageValue | null => {
  if (!isBrowser()) {
    return null;
  }

  const snapshot: ResourceStatusSnapshotStorageValue = {
    version: 1,
    updatedAt: new Date().toISOString(),
    items,
  };

  try {
    window.localStorage.setItem(getResourceStatusSnapshotStorageKey(userKey), JSON.stringify(snapshot));
    return snapshot;
  } catch {
    return null;
  }
};
