/**
 * Self-contained Jalali (Solar Hijri) calendar helpers.
 *
 * The backend always speaks Gregorian (`YYYY-MM-DD HH:mm:ss`) and the manual
 * time picker stays Gregorian too, so these helpers exist purely to render an
 * extra, read-only Persian representation of a value next to it.
 *
 * The conversion is the classic arithmetic algorithm (the same one used by
 * `jalaali-js`), implemented here so the project does not need a new runtime
 * dependency.
 */

const div = (a: number, b: number) => ~~(a / b);
const mod = (a: number, b: number) => a - ~~(a / b) * b;

/** Years where the 33-year leap cycle of the Jalali calendar breaks. */
const LEAP_BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192,
  2262, 2324, 2394, 2456, 3178,
];

export const JALALI_MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

export interface JalaliDateParts {
  year: number;
  month: number;
  day: number;
}

export interface GregorianDateParts {
  year: number;
  month: number;
  day: number;
}

interface JalaliCalendarInfo {
  /** 0 when the given Jalali year is a leap year. */
  leap: number;
  gregorianYear: number;
  /** Day of March that holds 1 Farvardin of the given Jalali year. */
  march: number;
}

const jalaliCalendarInfo = (jalaliYear: number): JalaliCalendarInfo => {
  const lastBreak = LEAP_BREAKS[LEAP_BREAKS.length - 1];

  if (jalaliYear < LEAP_BREAKS[0] || jalaliYear >= lastBreak) {
    throw new RangeError(
      `سال شمسی خارج از بازه پشتیبانی‌شده است: ${jalaliYear}`,
    );
  }

  const gregorianYear = jalaliYear + 621;
  let leapJ = -14;
  let previousBreak = LEAP_BREAKS[0];
  let jump = 0;

  for (let index = 1; index < LEAP_BREAKS.length; index += 1) {
    const currentBreak = LEAP_BREAKS[index];
    jump = currentBreak - previousBreak;

    if (jalaliYear < currentBreak) {
      break;
    }

    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    previousBreak = currentBreak;
  }

  let n = jalaliYear - previousBreak;
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);

  if (mod(jump, 33) === 4 && jump - n === 4) {
    leapJ += 1;
  }

  const leapG =
    div(gregorianYear, 4) - div((div(gregorianYear, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;

  if (jump - n < 6) {
    n = n - jump + div(jump + 4, 33) * 33;
  }

  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) {
    leap = 4;
  }

  return { leap, gregorianYear, march };
};

/** Gregorian calendar date -> Julian day number. */
const gregorianToJulianDay = (year: number, month: number, day: number) => {
  let julianDay =
    div((year + div(month - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(month + 9, 12) + 2, 5) +
    day -
    34840408;

  julianDay =
    julianDay - div(div(year + 100100 + div(month - 8, 6), 100) * 3, 4) + 752;

  return julianDay;
};

/** Julian day number -> Gregorian calendar date. */
const julianDayToGregorian = (julianDay: number): GregorianDateParts => {
  let j = 4 * julianDay + 139361631;
  j = j + div(div(4 * julianDay + 183187720, 146097) * 3, 4) * 4 - 3908;

  const i = div(mod(j, 1461), 4) * 5 + 308;
  const day = div(mod(i, 153), 5) + 1;
  const month = mod(div(i, 153), 12) + 1;
  const year = div(j, 1461) - 100100 + div(8 - month, 6);

  return { year, month, day };
};

const jalaliToJulianDay = (year: number, month: number, day: number) => {
  const info = jalaliCalendarInfo(year);

  return (
    gregorianToJulianDay(info.gregorianYear, 3, info.march) +
    (month - 1) * 31 -
    div(month, 7) * (month - 7) +
    day -
    1
  );
};

const julianDayToJalali = (julianDay: number): JalaliDateParts => {
  const gregorianYear = julianDayToGregorian(julianDay).year;
  let year = gregorianYear - 621;
  const info = jalaliCalendarInfo(year);
  const farvardinFirst = gregorianToJulianDay(gregorianYear, 3, info.march);

  let offset = julianDay - farvardinFirst;

  if (offset >= 0) {
    if (offset <= 185) {
      return {
        year,
        month: 1 + div(offset, 31),
        day: mod(offset, 31) + 1,
      };
    }

    offset -= 186;
  } else {
    year -= 1;
    offset += 179;

    if (info.leap === 1) {
      offset += 1;
    }
  }

  return {
    year,
    month: 7 + div(offset, 30),
    day: mod(offset, 30) + 1,
  };
};

export const isJalaliLeapYear = (year: number) =>
  jalaliCalendarInfo(year).leap === 0;

/** Number of days in a given Jalali month (29/30/31). */
export const jalaliMonthLength = (year: number, month: number) => {
  if (month <= 6) {
    return 31;
  }

  if (month <= 11) {
    return 30;
  }

  return isJalaliLeapYear(year) ? 30 : 29;
};

export const gregorianToJalali = (
  year: number,
  month: number,
  day: number,
): JalaliDateParts => julianDayToJalali(gregorianToJulianDay(year, month, day));

export const jalaliToGregorian = (
  year: number,
  month: number,
  day: number,
): GregorianDateParts =>
  julianDayToGregorian(jalaliToJulianDay(year, month, day));

/** Persian digits for user-facing dates and clock values. */
export const toPersianDigits = (value: string | number) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

const pad = (value: number) => String(value).padStart(2, "0");

export interface WallClockParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/**
 * Parses the Gregorian wall-clock string used across the settings panel
 * (`YYYY-MM-DDTHH:mm:ss`, also tolerating a space separator and no seconds).
 */
export const parseWallClockValue = (value: string): WallClockParts | null => {
  const match = value
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);

  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6] ?? "0"),
  };
};

/**
 * Short Persian label of a Gregorian wall-clock string, e.g.
 * `۱۴۰۵/۰۵/۰۴ — ۱۶:۳۹:۲۰`.
 */
export const formatJalaliWallClockLabel = (value: string) => {
  const parts = parseWallClockValue(value);

  if (!parts) {
    return null;
  }

  const jalali = gregorianToJalali(parts.year, parts.month, parts.day);
  const date = `${jalali.year}/${pad(jalali.month)}/${pad(jalali.day)}`;
  const time = `${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;

  return toPersianDigits(`${time} — ${date}`);
};

/** Long Persian label, e.g. `۴ مرداد ۱۴۰۵، ساعت ۱۶:۳۹:۲۰`. */
export const formatJalaliLongLabel = (value: string) => {
  const parts = parseWallClockValue(value);

  if (!parts) {
    return null;
  }

  const jalali = gregorianToJalali(parts.year, parts.month, parts.day);
  const monthName = JALALI_MONTH_NAMES[jalali.month - 1];
  const time = `${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;

  return toPersianDigits(
    `${jalali.day} ${monthName} ${jalali.year}، ساعت ${time}`,
  );
};
