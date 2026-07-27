import {
  Box,
  Button,
  IconButton,
  Popover,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { MdCalendarMonth, MdChevronLeft, MdChevronRight } from "react-icons/md";
import {
  JALALI_MONTH_NAMES,
  formatJalaliWallClockLabel,
  gregorianToJalali,
  jalaliMonthLength,
  jalaliToGregorian,
  parseWallClockValue,
  toPersianDigits,
} from "../../../utils/jalali";
import { settingsPrimaryButtonSx, settingsTechnicalFieldSx } from "./styles";
import { settingsOutlinedButtonSx } from "./styles";

const WEEKDAY_SHORT_NAMES = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

export interface JalaliDateTimeFieldProps {
  label: string;
  /** Gregorian wall-clock value, `YYYY-MM-DDTHH:mm:ss`. */
  value: string;
  /** Called with a Gregorian wall-clock value; the backend format never changes. */
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string | null;
  disabled?: boolean;
}

type TimeField = "hour" | "minute" | "second";

interface DraftState {
  year: number;
  month: number;
  day: number;
  /** Time parts are kept as text so a two-digit value can be typed freely. */
  hour: string;
  minute: string;
  second: string;
}

const TIME_LIMITS: Record<TimeField, { max: number; label: string }> = {
  hour: { max: 23, label: "ساعت" },
  minute: { max: 59, label: "دقیقه" },
  second: { max: 59, label: "ثانیه" },
};

const pad = (value: number) => String(value).padStart(2, "0");

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** Converts Persian/Arabic-Indic digits to plain Latin ones. */
const toLatinDigits = (value: string) =>
  value
    .replace(/[\u06F0-\u06F9]/g, (digit) =>
      String(digit.charCodeAt(0) - 0x06f0),
    )
    .replace(/[\u0660-\u0669]/g, (digit) =>
      String(digit.charCodeAt(0) - 0x0660),
    );

/** Jalali draft of "now", used when the incoming value cannot be parsed. */
const nowDraft = (): DraftState => {
  const now = new Date();
  const jalali = gregorianToJalali(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  );

  return {
    year: jalali.year,
    month: jalali.month,
    day: jalali.day,
    hour: pad(now.getHours()),
    minute: pad(now.getMinutes()),
    second: pad(now.getSeconds()),
  };
};

const draftFromValue = (value: string): DraftState => {
  const parts = parseWallClockValue(value);

  if (!parts) {
    return nowDraft();
  }

  const jalali = gregorianToJalali(parts.year, parts.month, parts.day);

  return {
    year: jalali.year,
    month: jalali.month,
    day: jalali.day,
    hour: pad(parts.hour),
    minute: pad(parts.minute),
    second: pad(parts.second),
  };
};

/** `null` when the text is empty or outside the allowed range. */
const readTimePart = (text: string, field: TimeField) => {
  if (text.trim() === "") {
    return null;
  }

  const numeric = Number(text);
  if (!Number.isInteger(numeric)) {
    return null;
  }

  return numeric >= 0 && numeric <= TIME_LIMITS[field].max ? numeric : null;
};

/** Draft -> Gregorian wall-clock string expected by the settings panel. */
const draftToWallClock = (draft: DraftState) => {
  const gregorian = jalaliToGregorian(draft.year, draft.month, draft.day);
  const hour = readTimePart(draft.hour, "hour") ?? 0;
  const minute = readTimePart(draft.minute, "minute") ?? 0;
  const second = readTimePart(draft.second, "second") ?? 0;

  return (
    `${gregorian.year}-${pad(gregorian.month)}-${pad(gregorian.day)}` +
    `T${pad(hour)}:${pad(minute)}:${pad(second)}`
  );
};

/**
 * Fully Persian date & time picker.
 *
 * Everything the operator sees is Jalali with Persian digits, while the value
 * handed back through `onChange` stays a Gregorian `YYYY-MM-DDTHH:mm:ss`
 * string, so the API contract is untouched.
 */
const JalaliDateTimeField = ({
  label,
  value,
  onChange,
  error = false,
  helperText,
  disabled = false,
}: JalaliDateTimeFieldProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [draft, setDraft] = useState<DraftState>(() => draftFromValue(value));

  useEffect(() => {
    setDraft(draftFromValue(value));
  }, [value]);

  const displayValue = useMemo(
    () => formatJalaliWallClockLabel(value) ?? "",
    [value],
  );

  const monthLength = jalaliMonthLength(draft.year, draft.month);

  /** Weekday (0 = Saturday) of the first day of the displayed month. */
  const firstWeekday = useMemo(() => {
    const gregorian = jalaliToGregorian(draft.year, draft.month, 1);
    const date = new Date(gregorian.year, gregorian.month - 1, gregorian.day);

    return (date.getDay() + 1) % 7;
  }, [draft.month, draft.year]);

  const timeErrors = useMemo(
    () => ({
      hour: readTimePart(draft.hour, "hour") === null,
      minute: readTimePart(draft.minute, "minute") === null,
      second: readTimePart(draft.second, "second") === null,
    }),
    [draft.hour, draft.minute, draft.second],
  );

  const hasTimeError =
    timeErrors.hour || timeErrors.minute || timeErrors.second;

  const openPicker = (event: MouseEvent<HTMLElement>) => {
    if (disabled) {
      return;
    }

    setAnchorEl(event.currentTarget);
  };

  const closePicker = () => setAnchorEl(null);

  const shiftMonth = (delta: number) => {
    setDraft((current) => {
      const raw = current.month - 1 + delta;
      const year = current.year + Math.floor(raw / 12);
      const month = (((raw % 12) + 12) % 12) + 1;

      return {
        ...current,
        year,
        month,
        day: clamp(current.day, 1, jalaliMonthLength(year, month)),
      };
    });
  };

  /**
   * Keeps the typed text as-is (up to two digits) so the second digit of a
   * value such as ۱۵ can always be entered. Persian digits are accepted too.
   */
  const handleTimeChange = (field: TimeField, rawValue: string) => {
    const digits = toLatinDigits(rawValue).replace(/\D/g, "").slice(0, 2);

    setDraft((current) => ({ ...current, [field]: digits }));
  };

  /** Normalises the field on blur: empty becomes ۰۰ and the range is enforced. */
  const handleTimeBlur = (field: TimeField) => {
    setDraft((current) => {
      const numeric = Number(current[field]);
      const safeValue = Number.isInteger(numeric)
        ? clamp(numeric, 0, TIME_LIMITS[field].max)
        : 0;

      return { ...current, [field]: pad(safeValue) };
    });
  };

  const commit = () => {
    if (hasTimeError) {
      return;
    }

    onChange(draftToWallClock(draft));
    closePicker();
  };

  const timeFieldSx = {
    ...(settingsTechnicalFieldSx as Record<string, unknown>),
    width: 82,
    "& .MuiInputBase-input": { textAlign: "center", fontWeight: 700 },
  };

  const renderTimeField = (field: TimeField) => (
    <TextField
      label={TIME_LIMITS[field].label}
      value={toPersianDigits(draft[field])}
      onChange={(event) => handleTimeChange(field, event.target.value)}
      onBlur={() => handleTimeBlur(field)}
      error={timeErrors[field]}
      sx={timeFieldSx}
      slotProps={{
        inputLabel: { shrink: true },
        htmlInput: {
          inputMode: "numeric",
          maxLength: 2,
          "aria-label": TIME_LIMITS[field].label,
        },
      }}
    />
  );

  return (
    <Box sx={{ width: "100%" }}>
      <TextField
        fullWidth
        label={label}
        value={displayValue}
        onClick={openPicker}
        error={error}
        helperText={helperText ?? undefined}
        disabled={disabled}
        sx={settingsTechnicalFieldSx}
        slotProps={{
          inputLabel: { shrink: true },
          htmlInput: {
            readOnly: true,
            "aria-label": "انتخاب تاریخ و ساعت",
            style: { cursor: disabled ? "default" : "pointer" },
          },
          input: {
            endAdornment: (
              <MdCalendarMonth size={20} style={{ opacity: 0.75 }} />
            ),
          },
        }}
      />

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={closePicker}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{
          paper: {
            dir: "rtl",
            sx: {
              mt: 1,
              p: 1.75,
              width: "min(320px, calc(100vw - 32px))",
              borderRadius: "14px",
              color: "var(--color-text)",
              backgroundColor: "var(--color-card-bg)",
              border:
                "1px solid color-mix(in srgb, var(--color-primary) 24%, transparent)",
            },
          },
        }}
      >
        <Stack gap={1.5}>
          <Stack direction="row" alignItems="center" gap={1}>
            <IconButton
              size="small"
              aria-label="ماه قبل"
              onClick={() => shiftMonth(-1)}
              sx={{ color: "var(--color-primary)" }}
            >
              <MdChevronRight size={20} />
            </IconButton>

            <Typography
              sx={{
                flex: 1,
                textAlign: "center",
                fontWeight: 800,
                fontSize: "0.95rem",
              }}
            >
              {`${JALALI_MONTH_NAMES[draft.month - 1]} ${toPersianDigits(
                draft.year,
              )}`}
            </Typography>

            <IconButton
              size="small"
              aria-label="ماه بعد"
              onClick={() => shiftMonth(1)}
              sx={{ color: "var(--color-primary)" }}
            >
              <MdChevronLeft size={20} />
            </IconButton>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 0.5,
            }}
          >
            {WEEKDAY_SHORT_NAMES.map((name) => (
              <Typography
                key={name}
                aria-hidden
                sx={{
                  textAlign: "center",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "var(--color-secondary)",
                }}
              >
                {name}
              </Typography>
            ))}

            {Array.from({ length: firstWeekday }).map((_, index) => (
              <Box key={`blank-${index}`} />
            ))}

            {Array.from({ length: monthLength }).map((_, index) => {
              const day = index + 1;
              const isSelected = day === draft.day;

              return (
                <Box
                  key={day}
                  component="button"
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setDraft((current) => ({ ...current, day }))}
                  sx={{
                    height: 34,
                    cursor: "pointer",
                    borderRadius: "9px",
                    border: "1px solid transparent",
                    fontFamily: "inherit",
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: "0.84rem",
                    color: isSelected ? "var(--color-bg)" : "var(--color-text)",
                    backgroundColor: isSelected
                      ? "var(--color-primary)"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: isSelected
                        ? "var(--color-primary)"
                        : "color-mix(in srgb, var(--color-primary) 14%, transparent)",
                    },
                  }}
                >
                  {toPersianDigits(day)}
                </Box>
              );
            })}
          </Box>

          <Stack direction="row" gap={1} justifyContent="center">
            {renderTimeField("hour")}
            {renderTimeField("minute")}
            {renderTimeField("second")}
          </Stack>

          {hasTimeError ? (
            <Typography
              sx={{
                fontSize: "0.78rem",
                fontWeight: 700,
                textAlign: "start",
                color: "var(--color-error)",
              }}
            >
              ساعت بین ۰ تا ۲۳ و دقیقه و ثانیه بین ۰ تا ۵۹ مجاز است.
            </Typography>
          ) : null}

          <Stack direction="row" gap={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => setDraft(nowDraft())}
              sx={settingsOutlinedButtonSx}
            >
              اکنون
            </Button>
            <Button
              variant="contained"
              onClick={commit}
              disabled={hasTimeError}
              sx={settingsPrimaryButtonSx}
            >
              تایید
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </Box>
  );
};

export default JalaliDateTimeField;
