import type {
  RawSambaUserDetails,
  SambaUserTableItem,
  SambaUsersResponseData,
} from '../@types/samba';
import { formatUtcDateTimeToIran } from './dateTime';
import formatDetailValue from './formatDetailValue';

const toOptionalString = (value: unknown): string | undefined => {
  if (value == null) {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return undefined;
};

const normalizeKey = (key: string): string =>
  key.replace(/[\s_-]+/g, '').toLowerCase();

const findValue = (
  record: RawSambaUserDetails,
  keys: string[]
): { key: string; value: unknown } | undefined => {
  if (!record) {
    return undefined;
  }

  const normalizedTargets = keys.map(normalizeKey);

  for (const [currentKey, value] of Object.entries(record)) {
    if (normalizedTargets.includes(normalizeKey(currentKey))) {
      return { key: currentKey, value };
    }
  }

  return undefined;
};

const BOOLEAN_TRUE_VALUES = new Set([
  'true',
  'yes',
  'y',
  '1',
  'enabled',
  'enable',
  'active',
  'on',
]);

const BOOLEAN_FALSE_VALUES = new Set([
  'false',
  'no',
  'n',
  '0',
  'disabled',
  'disable',
  'inactive',
  'off',
]);

const toOptionalBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return undefined;
    }

    return value !== 0;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (!normalized) {
      return undefined;
    }

    if (BOOLEAN_TRUE_VALUES.has(normalized)) {
      return true;
    }

    if (BOOLEAN_FALSE_VALUES.has(normalized)) {
      return false;
    }
  }

  return undefined;
};

const formatBooleanOrDate = (value: unknown): string | undefined => {
  const booleanValue = toOptionalBoolean(value);

  if (booleanValue !== undefined) {
    return booleanValue ? 'بله' : 'خیر';
  }

  const formattedDate = formatUtcDateTimeToIran(value);

  if (formattedDate) {
    return formattedDate;
  }

  return toOptionalString(value);
};

const formatDateValue = (value: unknown): string | undefined =>
  formatUtcDateTimeToIran(value) ?? toOptionalString(value);

const TIME_KEYS = new Set([
  'logontime',
  'logofftime',
  'kickofftime',
  'passwordlastset',
  'passwordcanchange',
]);

const enhanceDetailsRecord = (
  record: RawSambaUserDetails
): Record<string, string> => {
  const enhanced: Record<string, string> = {};

  Object.entries(record ?? {}).forEach(([key, value]) => {
    const normalizedKey = normalizeKey(key);
    let displayValue: string | undefined;

    if (normalizedKey === 'passwordmustchange') {
      displayValue = formatBooleanOrDate(value);
    } else if (TIME_KEYS.has(normalizedKey)) {
      displayValue = formatDateValue(value);
    } else {
      displayValue = toOptionalString(value);
    }

    enhanced[key] = displayValue ?? formatDetailValue(value);
  });

  return enhanced;
};

const normalizeSambaUser = (
  identifier: string,
  value: unknown,
  index: number
): SambaUserTableItem => {
  const record: RawSambaUserDetails =
    typeof value === 'object' && value !== null
      ? (value as RawSambaUserDetails)
      : {};

  const usernameEntry =
    findValue(record, ['username', 'user', 'accountname', 'name']) ??
    (typeof value === 'string' ? { key: 'username', value } : undefined);

  const resolvedIdentifier = toOptionalString(identifier);
  const username =
    toOptionalString(usernameEntry?.value) ||
    resolvedIdentifier ||
    `samba-user-${index + 1}`;

  const domainEntry = findValue(record, ['domain', 'workgroup']);
  const profilePathEntry = findValue(record, [
    'profilepath',
    'profile_path',
    'profile',
  ]);
  const passwordMustChangeEntry = findValue(record, [
    'passwordmustchange',
    'pwdmustchange',
  ]);
  const logonTimeEntry = findValue(record, [
    'logontime',
    'lastlogon',
    'logon_time',
  ]);
  const logoffTimeEntry = findValue(record, ['logofftime', 'logoff_time']);
  const kickoffTimeEntry = findValue(record, ['kickofftime', 'kickoff_time']);
  const passwordLastSetEntry = findValue(record, [
    'passwordlastset',
    'pwdlastset',
  ]);
  const passwordCanChangeEntry = findValue(record, [
    'passwordcanchange',
    'pwdcanchange',
  ]);

  const details = enhanceDetailsRecord(record);

  const hasUsernameInDetails = Object.keys(details).some(
    (key) => normalizeKey(key) === 'username'
  );

  if (!hasUsernameInDetails && username) {
    details['Username'] = username;
  }

  return {
    id: username,
    username,
    domain: toOptionalString(domainEntry?.value),
    profilePath: toOptionalString(profilePathEntry?.value),
    passwordMustChange: formatBooleanOrDate(passwordMustChangeEntry?.value),
    logonTime: formatDateValue(logonTimeEntry?.value),
    logoffTime: formatDateValue(logoffTimeEntry?.value),
    kickoffTime: formatDateValue(kickoffTimeEntry?.value),
    passwordLastSet: formatDateValue(passwordLastSetEntry?.value),
    passwordCanChange: formatDateValue(passwordCanChangeEntry?.value),
    details,
  };
};

export const normalizeSambaUsers = (
  data: SambaUsersResponseData | undefined
): SambaUserTableItem[] => {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data.map((entry, index) =>
      normalizeSambaUser(String(index + 1), entry, index)
    );
  }

  return Object.entries(data).map(([key, entry], index) =>
    normalizeSambaUser(key, entry, index)
  );
};

export default normalizeSambaUsers;
