import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Wall-clock helper for the general-settings panel.
 *
 * The backend returns the *system* time as a formatted string
 * (`"2026-07-22 14:46:25 +0330"`). Re-fetching every second would hammer the
 * API, so the value is parsed once and then advanced locally with a 1s ticker.
 * The browser timezone is irrelevant: the parsed calendar fields are treated as
 * plain wall-clock numbers, so what is rendered always matches the server.
 */

const WALL_CLOCK_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/;

const UTC_OFFSET_PATTERN = /(UTC|GMT|Z|[+-]\d{2}:?\d{2})\s*$/i;

const pad = (value: number) => String(value).padStart(2, "0");

/** Reads the calendar fields out of the backend string, ignoring the offset. */
const parseWallClock = (value: unknown): Date | null => {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.trim().match(WALL_CLOCK_PATTERN);
  if (!match) {
    return null;
  }

  const parsed = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6] ?? "0"),
  );

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/** `"+0330"` / `"UTC"` suffix of the backend value, when present. */
export const readUtcOffsetLabel = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.trim().match(UTC_OFFSET_PATTERN);
  return match ? match[1].toUpperCase() : null;
};

export interface SystemWallClock {
  /** True when the source value could be parsed and the ticker is running. */
  isLive: boolean;
  /** `YYYY-MM-DD` of the system clock. */
  dateLabel: string | null;
  /** `HH:mm:ss` of the system clock. */
  timeLabel: string | null;
  /** `YYYY-MM-DD HH:mm:ss` of the system clock. */
  timestampLabel: string | null;
  /** Jalali rendering of the same instant, e.g. `۱۴۰۵/۰۵/۰۴`. */
  jalaliDateLabel: string | null;
  /** Offset suffix reported by the backend (`+0330`, `UTC`, …). */
  offsetLabel: string | null;
}

export interface UseSystemWallClockOptions {
  /** Pause the ticker (e.g. while the section is collapsed). */
  enabled?: boolean;
}

const formatJalali = (date: Date): string | null => {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return null;
  }
};

export const useSystemWallClock = (
  source: string | null | undefined,
  { enabled = true }: UseSystemWallClockOptions = {},
): SystemWallClock => {
  /** Anchor: server wall-clock value + the local `Date.now()` when we got it. */
  const anchorRef = useRef<{ wall: number; readAt: number } | null>(null);
  const [current, setCurrent] = useState<Date | null>(null);

  useEffect(() => {
    const parsed = parseWallClock(source);

    if (!parsed) {
      anchorRef.current = null;
      setCurrent(null);
      return;
    }

    anchorRef.current = { wall: parsed.getTime(), readAt: Date.now() };
    setCurrent(parsed);
  }, [source]);

  useEffect(() => {
    if (!enabled || !anchorRef.current) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const anchor = anchorRef.current;
      if (!anchor) {
        return;
      }

      setCurrent(new Date(anchor.wall + (Date.now() - anchor.readAt)));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [enabled, source]);

  return useMemo<SystemWallClock>(() => {
    if (!current) {
      return {
        isLive: false,
        dateLabel: null,
        timeLabel: null,
        timestampLabel: null,
        jalaliDateLabel: null,
        offsetLabel: readUtcOffsetLabel(source),
      };
    }

    const dateLabel = `${current.getFullYear()}-${pad(
      current.getMonth() + 1,
    )}-${pad(current.getDate())}`;
    const timeLabel = `${pad(current.getHours())}:${pad(
      current.getMinutes(),
    )}:${pad(current.getSeconds())}`;

    return {
      isLive: true,
      dateLabel,
      timeLabel,
      timestampLabel: `${dateLabel} ${timeLabel}`,
      jalaliDateLabel: formatJalali(current),
      offsetLabel: readUtcOffsetLabel(source),
    };
  }, [current, source]);
};

export default useSystemWallClock;
