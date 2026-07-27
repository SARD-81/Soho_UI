/**
 * Helpers that turn the raw `hwclock` API payload into values an ordinary
 * operator can read.
 *
 * The backend answer for `/api/system/time/hwclock/` contains a nested object
 * such as `{ "hw_time": { "utc": "...", "local": "..." } }`. Showing that JSON
 * in the UI is useless for a normal user, so everything here is about
 * extracting the two timestamps and describing the drift in Persian.
 */

import { parseWallClockValue } from "./jalali";

export interface HardwareClockTimes {
  utc: string | null;
  local: string | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const normalizeTimestamp = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed && parseWallClockValue(trimmed) ? trimmed : null;
};

const UTC_KEYS = ["utc", "utc_time", "universal", "hw_utc"];
const LOCAL_KEYS = ["local", "local_time", "localtime", "hw_local"];

/**
 * Walks the payload (any depth) and picks the first UTC / local timestamps it
 * can recognise, so a change in the backend envelope does not break the modal.
 */
export const extractHardwareClockTimes = (
  payload: unknown,
): HardwareClockTimes => {
  const result: HardwareClockTimes = { utc: null, local: null };
  const queue: unknown[] = [payload];

  while (queue.length > 0) {
    const current = queue.shift();

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    if (!isRecord(current)) {
      continue;
    }

    for (const [key, value] of Object.entries(current)) {
      const normalizedKey = key.toLowerCase();

      if (!result.utc && UTC_KEYS.includes(normalizedKey)) {
        result.utc = normalizeTimestamp(value);
      }

      if (!result.local && LOCAL_KEYS.includes(normalizedKey)) {
        result.local = normalizeTimestamp(value);
      }

      if (isRecord(value) || Array.isArray(value)) {
        queue.push(value);
      }
    }

    if (result.utc && result.local) {
      break;
    }
  }

  return result;
};

const toDate = (value: string | null | undefined): Date | null => {
  if (!value) {
    return null;
  }

  const parts = parseWallClockValue(value);

  if (!parts) {
    return null;
  }

  return new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
};

export type ClockDriftLevel = "aligned" | "minor" | "major" | "unknown";

export interface ClockDrift {
  level: ClockDriftLevel;
  /** Persian sentence describing the drift, ready to render. */
  label: string;
  seconds: number | null;
}

const describeDuration = (totalSeconds: number) => {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const chunks: string[] = [];

  if (days > 0) chunks.push(`${days} روز`);
  if (hours > 0) chunks.push(`${hours} ساعت`);
  if (minutes > 0) chunks.push(`${minutes} دقیقه`);
  if (seconds > 0 && days === 0 && hours === 0) chunks.push(`${seconds} ثانیه`);

  return chunks.length > 0 ? chunks.join(" و ") : "کمتر از یک ثانیه";
};

/**
 * Compares the motherboard clock with the operating-system clock and returns a
 * sentence such as «ساعت مادربرد ۳ دقیقه از سیستم عقب‌تر است».
 */
export const describeClockDrift = (
  systemTime: string | null | undefined,
  hardwareTime: string | null | undefined,
): ClockDrift => {
  const system = toDate(systemTime ?? null);
  const hardware = toDate(hardwareTime ?? null);

  if (!system || !hardware) {
    return {
      level: "unknown",
      label: "برای مقایسه، ابتدا ساعت مادربرد را بخوانید.",
      seconds: null,
    };
  }

  const diffSeconds = Math.round(
    (hardware.getTime() - system.getTime()) / 1000,
  );
  const absolute = Math.abs(diffSeconds);

  if (absolute <= 2) {
    return {
      level: "aligned",
      label: "ساعت مادربرد و ساعت سیستم یکسان هستند.",
      seconds: diffSeconds,
    };
  }

  const duration = describeDuration(absolute);
  const direction = diffSeconds > 0 ? "جلوتر" : "عقب‌تر";

  return {
    level: absolute <= 60 ? "minor" : "major",
    label: `ساعت مادربرد ${duration} از ساعت سیستم ${direction} است.`,
    seconds: diffSeconds,
  };
};
