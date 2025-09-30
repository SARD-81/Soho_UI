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

const toOptionalBoolean = (value: unknown): boolean | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (['true', '1', 'yes', 'y'].includes(normalized)) {
      return true;
    }

    if (['false', '0', 'no', 'n'].includes(normalized)) {
      return false;
    }

    return undefined;
  }

  if (typeof value === 'number') {
    if (Number.isNaN(value)) {
      return undefined;
    }

    if (value === 1) {
      return true;
    }

    if (value === 0) {
      return false;
    }
  }

  return undefined;
};

const pickFirstValue = (
  record: Record<string, unknown>,
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

const pickBooleanValue = (
  record: Record<string, unknown>,
  keys: string[]
): boolean | undefined => {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      const value = toOptionalBoolean(record[key]);

      if (value !== undefined) {
        return value;
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
  const normalizedIdentifier = toOptionalString(identifier);
  const usernameFromValue =
    typeof value === 'string' ? toOptionalString(value) : undefined;

  const record =
    typeof value === 'object' && value !== null
      ? (value as Record<string, unknown>)
      : {};

  const resolvedUsername =
    usernameFromValue ??
    pickFirstValue(record, ['username', 'user', 'name']) ??
    normalizedIdentifier ??
    `user-${index + 1}`;

  const username = resolvedUsername || `user-${index + 1}`;
  const uid = pickFirstValue(record, ['uid', 'user_id', 'userId']);
  const gid = pickFirstValue(record, ['gid', 'group_id', 'groupId']);
  const fullName = pickFirstValue(record, [
    'full_name',
    'gecos',
    'displayName',
  ]);
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
  const hasSambaUser = pickBooleanValue(record, [
    'hasSambaUser',
    'has_samba_user',
    'sambaUserExists',
    'samba_user_exists',
  ]);

  const raw: RawOsUserDetails =
    typeof value === 'object' && value !== null
      ? record
      : (usernameFromValue ?? username);

  return {
    id: username,
    username,
    fullName,
    uid,
    gid,
    homeDirectory,
    loginShell,
    hasSambaUser,
    raw,
  };
};

export const normalizeOsUsers = (
  data: RawOsUserDetails[] | Record<string, RawOsUserDetails> | undefined
): OsUserTableItem[] => {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data.map((entry, index) =>
      normalizeRecord(String(index + 1), entry, index)
    );
  }

  return Object.entries(data).map(([key, entry], index) =>
    normalizeRecord(key, entry, index)
  );
};
