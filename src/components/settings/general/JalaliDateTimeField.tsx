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

interface DraftState {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const pad = (value: number) => String(value).padStart(2, "0");

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

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
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds(),
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
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
};

/** Draft -> Gregorian wall-clock string expected by the settings panel. */
const draftToWallClock = (draft: DraftState) => {
  const gregorian = jalaliToGregorian(draft.year, draft.month, draft.day);

  return (
    `${gregorian.year}-${pad(gregorian.month)}-${pad(gregorian.day)}` +
    `T${pad(draft.hour)}:${pad(draft.minute)}:${pad(draft.second)}`
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

  const updateTime = (
    field: "hour" | "minute" | "second",
    rawValue: string,
  ) => {
    const numeric = Number(rawValue.replace(/\D/g, ""));
    const max = field === "hour" ? 23 : 59;

    setDraft((current) => ({
      ...current,
      [field]: clamp(Number.isNaN(numeric) ? 0 : numeric, 0, max),
    }));
  };

  const commit = () => {
    onChange(draftToWallClock(draft));
    closePicker();
  };

  const timeFieldSx = {
    ...(settingsTechnicalFieldSx as Record<string, unknown>),
    width: 72,
    "& .MuiInputBase-input": { textAlign: "center", fontWeight: 700 },
  };

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
            <TextField
              label="ساعت"
              value={pad(draft.hour)}
              onChange={(event) => updateTime("hour", event.target.value)}
              sx={timeFieldSx}
              slotProps={{
                htmlInput: { inputMode: "numeric", maxLength: 2 },
              }}
            />
            <TextField
              label="دقیقه"
              value={pad(draft.minute)}
              onChange={(event) => updateTime("minute", event.target.value)}
              sx={timeFieldSx}
              slotProps={{
                htmlInput: { inputMode: "numeric", maxLength: 2 },
              }}
            />
            <TextField
              label="ثانیه"
              value={pad(draft.second)}
              onChange={(event) => updateTime("second", event.target.value)}
              sx={timeFieldSx}
              slotProps={{
                htmlInput: { inputMode: "numeric", maxLength: 2 },
              }}
            />
          </Stack>

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
