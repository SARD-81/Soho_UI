import type { OsUserTableItem, RawOsUserDetails } from '../@types/users';

const toOptionalString = (value: unknown): string | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value.trim() ? value : undefined;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return undefined;
};

const parseKeyValueString = (
  value: string,
  keys: string[]
): string | undefined => {
  const separatorMatch = value.match(/[:=]/);

  if (!separatorMatch) {
    return undefined;
  }

  const separatorIndex = separatorMatch.index ?? -1;

  if (separatorIndex === -1) {
    return undefined;
  }

  const key = value.slice(0, separatorIndex).trim().toLowerCase();
  const match = keys.find((candidate) => candidate.toLowerCase() === key);

  if (!match) {
    return undefined;
  }

  const parsedValue = value.slice(separatorIndex + 1).trim();

  return toOptionalString(parsedValue);
};

const pickFirstValue = (
  record: RawOsUserDetails,
  keys: string[]
): string | undefined => {
  const queue: RawOsUserDetails[] = [record];
  const visited = new WeakSet<object>();

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || typeof current !== 'object') {
      continue;
    }

    if (visited.has(current)) {
      continue;
    }

    visited.add(current);

    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(current, key)) {
        const value = current[key];
        const normalized = toOptionalString(value);

        if (normalized) {
          return normalized;
        }
      }
    }

    const descriptorCandidate = toOptionalString(
      (current['key'] ??
        current['name'] ??
        current['field'] ??
        current['label'] ??
        current['title']) as unknown
    );

    if (descriptorCandidate) {
      const descriptor = descriptorCandidate.toLowerCase();
      const descriptorMatch = keys.find(
        (key) => key.toLowerCase() === descriptor
      );

      if (descriptorMatch) {
        const descriptorValue = toOptionalString(
          (current['value'] ??
            current['val'] ??
            current['content'] ??
            current['data'] ??
            current['text']) as unknown
        );

        if (descriptorValue) {
          return descriptorValue;
        }
      }
    }

    for (const value of Object.values(current)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === 'object') {
            queue.push(item as RawOsUserDetails);
          } else if (typeof item === 'string') {
            const parsed = parseKeyValueString(item, keys);

            if (parsed) {
              return parsed;
            }
          }
        }
      } else if (value && typeof value === 'object') {
        queue.push(value as RawOsUserDetails);
      }
    }
  }

  return undefined;
};

const normalizeRecord = (
  identifier: string,
  value: unknown,
  index: number
): OsUserTableItem => {
  const record =
    typeof value === 'object' && value !== null
      ? (value as RawOsUserDetails)
      : ({} as RawOsUserDetails);

  const resolvedUsername =
    pickFirstValue(record, ['username', 'user', 'name']) ?? identifier;

  const username = resolvedUsername || `user-${index + 1}`;
  const uid = pickFirstValue(record, ['uid', 'user_id', 'userId']);
  const gid = pickFirstValue(record, ['gid', 'group_id', 'groupId']);
  const fullName = pickFirstValue(record, ['full_name', 'gecos', 'displayName']);
  const homeDirectory = pickFirstValue(record, [
    'home_directory',
    'homeDirectory',
    'home',
    'directory',
    'homeDir',
  ]);
  const loginShell = pickFirstValue(record, [
    'login_shell',
    'loginShell',
    'shell',
    'shell_path',
  ]);

  return {
    id: username || `user-${index + 1}`,
    username,
    fullName,
    uid,
    gid,
    homeDirectory,
    loginShell,
    raw: record,
  };
};

export const normalizeOsUsers = (
  data: RawOsUserDetails[] | Record<string, RawOsUserDetails> | undefined
): OsUserTableItem[] => {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data.map((entry, index) => normalizeRecord(String(index + 1), entry, index));
  }

  return Object.entries(data).map(([key, entry], index) =>
    normalizeRecord(key, entry, index)
  );
};
