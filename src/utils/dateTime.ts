const IRAN_TIME_ZONE = 'Asia/Tehran';

const IRAN_DATE_TIME_FORMATTER = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
  dateStyle: 'medium',
  timeStyle: 'short',
  hourCycle: 'h23',
  timeZone: IRAN_TIME_ZONE,
});

const NEVER_REGEX = /^never$/i;

const toDate = (value: string | number | Date): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const timestamp =
      Math.abs(value) < 1_000_000_000_000 ? value * 1000 : value;
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) {
      return toDate(numeric);
    }

    const parsedDirect = Date.parse(trimmed);
    if (!Number.isNaN(parsedDirect)) {
      return new Date(parsedDirect);
    }

    const parsedWithUtc = Date.parse(`${trimmed}Z`);
    if (!Number.isNaN(parsedWithUtc)) {
      return new Date(parsedWithUtc);
    }
  }

  return null;
};

export const formatUtcDateTimeToIran = (value: unknown): string | undefined => {
  if (value == null) {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      return undefined;
    }

    if (NEVER_REGEX.test(trimmed)) {
      return 'هرگز';
    }

    const date = toDate(trimmed);

    if (date) {
      return IRAN_DATE_TIME_FORMATTER.format(date);
    }

    return trimmed;
  }

  if (typeof value === 'number' || value instanceof Date) {
    const date = toDate(value);

    if (date) {
      return IRAN_DATE_TIME_FORMATTER.format(date);
    }
  }

  return undefined;
};

export default formatUtcDateTimeToIran;
