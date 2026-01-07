import type { NfsShareOptionKey, NfsShareOptionValues } from '../@types/nfs';

export const NFS_OPTION_KEYS: NfsShareOptionKey[] = [
  'read_write',
  'sync',
  'root_squash',
  'all_squash',
  'insecure',
  'no_subtree_check',
];

export const NFS_OPTION_DEFAULTS: NfsShareOptionValues = {
  read_write: true,
  sync: true,
  root_squash: true,
  all_squash: false,
  insecure: false,
  no_subtree_check: true,
};

const resolveOptionValue = (
  options: Record<string, unknown> | null | undefined,
  key: NfsShareOptionKey
): boolean | undefined => {
  if (!options) {
    return undefined;
  }

  if (key === 'read_write') {
    const value = options.read_write ?? options.rw;
    return typeof value === 'boolean' ? value : undefined;
  }

  if (key === 'sync') {
    const value = options.sync ?? options.async;
    if (typeof value === 'boolean') {
      return options.sync !== undefined ? value : !value;
    }
    return undefined;
  }

  const direct = options[key];
  return typeof direct === 'boolean' ? direct : undefined;
};

export const resolveOptionValues = (
  options: Record<string, unknown> | null | undefined
): NfsShareOptionValues => {
  const resolved: NfsShareOptionValues = { ...NFS_OPTION_DEFAULTS };

  NFS_OPTION_KEYS.forEach((key) => {
    const value = resolveOptionValue(options, key);
    if (value !== undefined) {
      resolved[key] = value;
    }
  });

  return resolved;
};

export const resolveEnabledOptionKeys = (
  options: Record<string, unknown> | null | undefined
): NfsShareOptionKey[] => {
  if (!options) {
    return [];
  }

  return NFS_OPTION_KEYS.filter((key) => resolveOptionValue(options, key) !== undefined);
};

export const buildOptionPayload = (
  enabledKeys: NfsShareOptionKey[],
  values: NfsShareOptionValues
): Record<string, boolean> => {
  if (enabledKeys.length === 0) {
    return { ...NFS_OPTION_DEFAULTS };
  }

  return enabledKeys.reduce<Record<string, boolean>>((acc, key) => {
    acc[key] = values[key];
    return acc;
  }, {});
};