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

const pickFirstValue = (
  record: RawOsUserDetails,
  keys: string[]
): string | undefined => {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      const value = record[key];
      const normalized = toOptionalString(value);

      if (normalized) {
        return normalized;
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
