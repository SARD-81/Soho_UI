import type {
  HostnameInfo,
  HwclockResult,
  SystemTimeInfo,
  SystemVersionInfo,
} from '../@types/generalSettings';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const normalizeKey = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '');

const unwrapData = (payload: unknown) => {
  if (!isRecord(payload)) {
    return payload;
  }

  return Object.prototype.hasOwnProperty.call(payload, 'data')
    ? payload.data
    : payload;
};

const findNestedValue = (
  source: unknown,
  aliases: readonly string[],
  depth = 0
): unknown => {
  if (depth > 5 || source == null) {
    return undefined;
  }

  const normalizedAliases = new Set(aliases.map(normalizeKey));

  if (isRecord(source)) {
    for (const [key, value] of Object.entries(source)) {
      if (normalizedAliases.has(normalizeKey(key))) {
        return value;
      }
    }

    for (const value of Object.values(source)) {
      const nestedValue = findNestedValue(value, aliases, depth + 1);
      if (nestedValue !== undefined) {
        return nestedValue;
      }
    }
  }

  if (Array.isArray(source)) {
    for (const item of source) {
      const nestedValue = findNestedValue(item, aliases, depth + 1);
      if (nestedValue !== undefined) {
        return nestedValue;
      }
    }
  }

  return undefined;
};

const normalizeString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return null;
};

const normalizeBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on', 'enabled', 'active', 'local'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'off', 'disabled', 'inactive', 'utc'].includes(normalized)) {
      return false;
    }
  }

  return null;
};

const normalizeStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(
        value
          .map(normalizeString)
          .filter((item): item is string => Boolean(item))
      )
    );
  }

  if (typeof value === 'string') {
    return Array.from(
      new Set(
        value
          .split(/[\n,;]+/)
          .map((item) => item.trim())
          .filter(Boolean)
      )
    );
  }

  return [];
};

export const normalizeSystemTimeInfo = (payload: unknown): SystemTimeInfo => {
  const data = unwrapData(payload);

  return {
    localTime: normalizeString(
      findNestedValue(data, [
        'local_time',
        'localtime',
        'system_local_time',
        'current_local_time',
        'local_datetime',
        'datetime_local',
      ])
    ),
    utcTime: normalizeString(
      findNestedValue(data, [
        'utc_time',
        'utctime',
        'system_utc_time',
        'current_utc_time',
        'utc_datetime',
      ])
    ),
    rtcTime: normalizeString(
      findNestedValue(data, [
        'rtc_time',
        'rtctime',
        'hardware_time',
        'hardware_clock',
        'hwclock',
      ])
    ),
    timezone: normalizeString(
      findNestedValue(data, ['timezone', 'time_zone', 'zone'])
    ),
    ntpEnabled: normalizeBoolean(
      findNestedValue(data, [
        'ntp_enabled',
        'ntpenabled',
        'ntp_active',
        'ntpactive',
        'use_ntp',
      ])
    ),
    ntpSynchronized: normalizeBoolean(
      findNestedValue(data, [
        'ntp_synchronized',
        'ntpsynchronized',
        'ntp_synced',
        'system_clock_synchronized',
        'synchronized',
        'synced',
      ])
    ),
    rtcInLocalTimezone: normalizeBoolean(
      findNestedValue(data, [
        'rtc_in_local_tz',
        'rtc_in_local_timezone',
        'rtc_localtime',
        'rtc_local',
        'local_rtc',
      ])
    ),
    ntpServers: normalizeStringArray(
      findNestedValue(data, [
        'ntp_servers',
        'configured_ntp_servers',
        'timeservers',
        'time_servers',
        'servers',
      ])
    ),
    raw: data,
  };
};

export const normalizeTimezoneList = (payload: unknown): string[] => {
  const data = unwrapData(payload);
  const candidate =
    (Array.isArray(data) ? data : undefined) ??
    findNestedValue(data, ['timezones', 'zones', 'timezone_list', 'items']);

  return normalizeStringArray(candidate).sort((left, right) =>
    left.localeCompare(right, 'en')
  );
};

export const normalizeHostnameInfo = (payload: unknown): HostnameInfo => {
  const data = unwrapData(payload);
  const staticHostname = normalizeString(
    findNestedValue(data, ['static_hostname', 'statichostname', 'persistent_hostname'])
  );
  const currentHostname = normalizeString(
    findNestedValue(data, [
      'hostname',
      'current_hostname',
      'currenthostname',
      'transient_hostname',
    ])
  );

  return {
    currentHostname: currentHostname ?? staticHostname,
    staticHostname: staticHostname ?? currentHostname,
    raw: data,
  };
};

export const normalizeSystemVersion = (payload: unknown): SystemVersionInfo => {
  const data = unwrapData(payload);
  let lines: string[] = [];

  if (Array.isArray(data)) {
    lines = data
      .map(normalizeString)
      .filter((item): item is string => Boolean(item));
  } else if (typeof data === 'string') {
    lines = data
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } else {
    const candidate = findNestedValue(data, [
      'lines',
      'version_lines',
      'version',
      'content',
      'text',
    ]);
    lines = normalizeStringArray(candidate);
  }

  return {
    lines,
    text: lines.join('\n'),
    raw: data,
  };
};

const stringifyCompact = (value: unknown): string | null => {
  const normalized = normalizeString(value);
  if (normalized) {
    return normalized;
  }

  if (value == null) {
    return null;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export const normalizeHwclockResult = (payload: unknown): HwclockResult => {
  const data = unwrapData(payload);
  const message =
    normalizeString(findNestedValue(payload, ['message'])) ??
    'عملیات ساعت سخت‌افزاری با موفقیت انجام شد.';
  const displayValue = stringifyCompact(
    findNestedValue(data, [
      'rtc_time',
      'hardware_time',
      'hardware_clock',
      'hwclock',
      'time',
      'output',
      'result',
    ]) ?? data
  );

  return { message, displayValue, raw: data };
};

export const validateHostname = (value: string) => {
  const hostname = value.trim().toLowerCase();

  if (!hostname) {
    return { value: hostname, error: 'نام میزبان الزامی است.' };
  }

  if (hostname.length > 253) {
    return { value: hostname, error: 'طول نام میزبان نباید بیشتر از ۲۵۳ کاراکتر باشد.' };
  }

  const labels = hostname.split('.');
  const labelPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

  if (labels.some((label) => !labelPattern.test(label))) {
    return {
      value: hostname,
      error:
        'نام میزبان باید مطابق RFC 1123 باشد؛ فقط حروف انگلیسی، عدد، خط تیره و نقطه مجاز است و هر بخش نباید با خط تیره شروع یا تمام شود.',
    };
  }

  return { value: hostname, error: null };
};

export const validateNtpServer = (value: string) => {
  const server = value.trim();

  if (!server) {
    return { value: server, error: 'آدرس سرور NTP نمی‌تواند خالی باشد.' };
  }

  if (server.length > 253 || /\s/.test(server)) {
    return { value: server, error: 'آدرس سرور NTP معتبر نیست.' };
  }

  if (!/^[a-zA-Z0-9._:-]+$/.test(server)) {
    return {
      value: server,
      error: 'در آدرس سرور NTP کاراکتر غیرمجاز وجود دارد.',
    };
  }

  return { value: server, error: null };
};

const padNumber = (value: number) => String(value).padStart(2, '0');

export const toDateTimeLocalValue = (value: unknown): string => {
  if (typeof value === 'string') {
    const match = value
      .trim()
      .match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6] ?? '00'}`;
    }
  }

  const parsed = value instanceof Date ? value : new Date(String(value ?? ''));
  const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;

  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(
    date.getDate()
  )}T${padNumber(date.getHours())}:${padNumber(date.getMinutes())}:${padNumber(
    date.getSeconds()
  )}`;
};

export const formatManualTimeForApi = (value: string) => {
  const match = value
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);

  if (!match) {
    return { value: '', error: 'تاریخ و ساعت واردشده معتبر نیست.' };
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? '0');
  const parsed = new Date(year, month - 1, day, hour, minute, second);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day ||
    parsed.getHours() !== hour ||
    parsed.getMinutes() !== minute ||
    parsed.getSeconds() !== second
  ) {
    return { value: '', error: 'تاریخ و ساعت واردشده معتبر نیست.' };
  }

  return {
    value: `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${padNumber(
      second
    )}`,
    error: null,
  };
};
