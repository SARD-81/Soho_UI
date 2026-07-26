import type { SxProps, Theme } from "@mui/material";
import type { CSSProperties } from "react";

/**
 * Shared design tokens for the settings panels.
 *
 * IMPORTANT (RTL): the app renders MUI through `stylis-plugin-rtl`
 * (see `src/rtl-cache.ts`), which mirrors *physical* CSS properties.
 * A hand written `direction: 'rtl'` is therefore flipped to `ltr`, and
 * `textAlign: 'right'` becomes `left` — which is exactly what broke the
 * bidi ordering of Persian sentences on the settings page.
 *
 * Rule for this folder: never set `direction`, `textAlign: 'right'`, `left`
 * or `right` by hand. The document is already `dir="rtl"` (see `index.html`)
 * and the MUI theme is RTL aware, so only logical properties are used below.
 */

export const settingsCardSx: SxProps<Theme> = {
  position: "relative",
  minWidth: 0,
  height: "100%",
  // Flex column + `mt: auto` on the footer keeps every action bar pinned to
  // the bottom edge, so cards in the same row line up perfectly.
  display: "flex",
  flexDirection: "column",
  p: { xs: 2, md: 2.5 },
  borderRadius: "16px",
  overflow: "hidden",
  textAlign: "start",
  color: "var(--color-text)",
  background:
    "linear-gradient(145deg, color-mix(in srgb, var(--color-card-bg) 96%, var(--color-primary) 4%) 0%, var(--color-card-bg) 100%)",
  border: "1px solid color-mix(in srgb, var(--color-primary) 22%, transparent)",
  boxShadow: "0 18px 48px -38px rgba(0, 0, 0, 0.72)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    borderColor: "color-mix(in srgb, var(--color-primary) 34%, transparent)",
    boxShadow: "0 22px 54px -38px rgba(0, 0, 0, 0.82)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    insetInlineStart: 0,
    insetBlock: 0,
    width: "3px",
    background:
      "linear-gradient(180deg, var(--color-primary), transparent 78%)",
    opacity: 0.72,
  },
};

export const settingsFieldSx: SxProps<Theme> = {
  "& .MuiInputBase-root": {
    color: "var(--color-text)",
    backgroundColor:
      "color-mix(in srgb, var(--color-background) 62%, transparent)",
    borderRadius: "10px",
  },
  "& .MuiInputBase-input": {
    color: "var(--color-text)",
    WebkitTextFillColor: "var(--color-text)",
    textAlign: "start",
  },
  "& .MuiInputBase-input.Mui-disabled": {
    color: "var(--color-text)",
    WebkitTextFillColor: "var(--color-text)",
    opacity: 0.68,
  },
  // Label placement is handled by the RTL-aware theme; only colors here.
  "& .MuiInputLabel-root": {
    color: "var(--color-secondary)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "var(--color-primary)",
  },
  "& .MuiFormHelperText-root": {
    mx: 0,
    mt: 0.75,
    textAlign: "start",
    color: "var(--color-secondary)",
    fontSize: "0.75rem",
    lineHeight: 1.9,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "color-mix(in srgb, var(--color-secondary) 34%, transparent)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "color-mix(in srgb, var(--color-primary) 50%, transparent)",
  },
  "& .MuiSvgIcon-root": {
    color: "var(--color-secondary)",
  },
};

/**
 * Field that holds an LTR technical value (hostname, IP, timezone id,
 * timestamp). The *value* is LTR and starts from the left edge of the box,
 * while the Persian label and helper text stay RTL.
 */
export const settingsTechnicalFieldSx: SxProps<Theme> = {
  ...(settingsFieldSx as Record<string, unknown>),
  "& .MuiInputBase-input": {
    color: "var(--color-text)",
    WebkitTextFillColor: "var(--color-text)",
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "0.01em",
  },
  "& .MuiInputBase-input.Mui-disabled": {
    color: "var(--color-text)",
    WebkitTextFillColor: "var(--color-text)",
    opacity: 0.68,
  },
};

/**
 * Inline style (NOT emotion) for inputs holding an LTR technical value.
 *
 * `stylis-plugin-rtl` mirrors every `direction` / `text-align` declaration it
 * sees, so writing `direction: 'ltr'` inside `sx` produces `direction: rtl`
 * in the browser. React inline styles bypass stylis entirely, so they are the
 * only reliable escape hatch. Pass it through `slotProps.htmlInput`:
 *
 * ```tsx
 * slotProps={{ htmlInput: { dir: 'ltr', style: ltrInputStyle } }}
 * ```
 */
export const ltrInputStyle: CSSProperties = {
  direction: "ltr",
  textAlign: "left",
  unicodeBidi: "isolate",
};

/** Inline style for read-only console output (hwclock dump). */
export const ltrBlockStyle: CSSProperties = {
  direction: "ltr",
  textAlign: "left",
  unicodeBidi: "isolate",
};

export const settingsPrimaryButtonSx: SxProps<Theme> = {
  minHeight: 40,
  px: 2.5,
  borderRadius: "9px",
  fontWeight: 800,
  fontSize: "0.86rem",
  whiteSpace: "nowrap",
  color: "var(--color-bg)",
  background:
    "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)",
  boxShadow:
    "0 12px 26px -18px color-mix(in srgb, var(--color-primary) 75%, transparent)",
  "& .MuiButton-startIcon": {
    marginInlineEnd: "8px",
    marginInlineStart: "-2px",
    marginRight: 0,
    marginLeft: 0,
  },
  "&:hover": {
    filter: "brightness(1.05)",
  },
  "&.Mui-disabled": {
    color: "color-mix(in srgb, var(--color-bg) 58%, transparent)",
    background:
      "color-mix(in srgb, var(--color-primary) 34%, var(--color-card-bg))",
  },
};

export const settingsOutlinedButtonSx: SxProps<Theme> = {
  minHeight: 40,
  px: 2.25,
  borderRadius: "9px",
  fontWeight: 800,
  fontSize: "0.86rem",
  whiteSpace: "nowrap",
  color: "var(--color-primary)",
  borderColor: "color-mix(in srgb, var(--color-primary) 58%, transparent)",
  "& .MuiButton-startIcon": {
    marginInlineEnd: "8px",
    marginInlineStart: "-2px",
    marginRight: 0,
    marginLeft: 0,
  },
  "&:hover": {
    borderColor: "var(--color-primary)",
    backgroundColor: "color-mix(in srgb, var(--color-primary) 9%, transparent)",
  },
};

export const settingsAlertSx: SxProps<Theme> = {
  borderRadius: "10px",
  textAlign: "start",
  "& .MuiAlert-icon": {
    marginInlineStart: 0,
    marginInlineEnd: 1,
    marginRight: 0,
    marginLeft: 0,
  },
  "& .MuiAlert-message": {
    width: "100%",
    textAlign: "start",
    lineHeight: 2,
    fontSize: "0.82rem",
  },
};

/** Dropdown surface for the timezone Autocomplete. */
export const settingsPopupSx: SxProps<Theme> = {
  color: "var(--color-text)",
  backgroundColor: "var(--color-card-bg)",
  border: "1px solid color-mix(in srgb, var(--color-primary) 22%, transparent)",
  "& .MuiAutocomplete-noOptions, & .MuiAutocomplete-loading": {
    color: "var(--color-secondary)",
    textAlign: "start",
    fontSize: "0.85rem",
  },
};

/** Read-only console-style output (hwclock dump). */
export const settingsCodeBlockSx: SxProps<Theme> = {
  m: 0,
  p: 1.5,
  maxHeight: 150,
  overflow: "auto",
  borderRadius: "10px",
  color: "var(--color-text)",
  backgroundColor:
    "color-mix(in srgb, var(--color-background) 72%, transparent)",
  border: "1px solid color-mix(in srgb, var(--color-primary) 14%, transparent)",
  fontFamily: "monospace",
  fontSize: "0.82rem",
};

/**
 * Action bar at the bottom of a settings card. `mt: auto` pushes it down so
 * that cards of different heights still align their buttons on one line.
 */
export const settingsCardFooterSx: SxProps<Theme> = {
  mt: "auto",
  pt: 1.75,
  display: "flex",
  flexWrap: "wrap",
  gap: 1,
  borderTop:
    "1px solid color-mix(in srgb, var(--color-secondary) 14%, transparent)",
};

/** Responsive card grid used instead of nested row/column stacks. */
export const settingsGridSx = (columns: number): SxProps<Theme> => ({
  display: "grid",
  gap: 2,
  alignItems: "stretch",
  gridTemplateColumns: {
    xs: "1fr",
    md: columns >= 3 ? "repeat(2, minmax(0, 1fr))" : "1fr",
    lg: `repeat(${columns}, minmax(0, 1fr))`,
  },
});

/* ------------------------------------------------------------------ *
 * Accordion sections of the general-settings tab
 * ------------------------------------------------------------------ */

/** Outer shell of one collapsible settings section. */
export const settingsAccordionSx: SxProps<Theme> = {
  position: "relative",
  overflow: "hidden",
  borderRadius: "16px !important",
  color: "var(--color-text)",
  backgroundColor: "var(--color-card-bg)",
  backgroundImage:
    "linear-gradient(145deg, color-mix(in srgb, var(--color-card-bg) 95%, var(--color-primary) 5%) 0%, var(--color-card-bg) 100%)",
  border: "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)",
  boxShadow: "0 18px 48px -40px rgba(0, 0, 0, 0.7)",
  transition:
    "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
  "&::before": { display: "none" },
  "&:hover": {
    borderColor: "color-mix(in srgb, var(--color-primary) 34%, transparent)",
  },
  "&.Mui-expanded": {
    borderColor: "color-mix(in srgb, var(--color-primary) 42%, transparent)",
    boxShadow: "0 26px 60px -40px rgba(0, 0, 0, 0.85)",
  },
  // Accent bar on the inline-start edge, mirrored automatically in RTL.
  "&::after": {
    content: '""',
    position: "absolute",
    insetInlineStart: 0,
    insetBlock: 0,
    width: "3px",
    background:
      "linear-gradient(180deg, var(--color-primary), transparent 82%)",
    opacity: 0.75,
    pointerEvents: "none",
  },
};

/** Clickable header row of a settings section. */
export const settingsAccordionSummarySx: SxProps<Theme> = {
  px: { xs: 1.75, md: 2.25 },
  py: { xs: 1.25, md: 1.5 },
  minHeight: "unset",
  gap: 1,
  "&.Mui-focusVisible": {
    backgroundColor:
      "color-mix(in srgb, var(--color-primary) 10%, transparent)",
  },
  "& .MuiAccordionSummary-content": {
    m: 0,
    minWidth: 0,
    "&.Mui-expanded": { m: 0 },
  },
  "& .MuiAccordionSummary-expandIconWrapper": {
    color: "var(--color-primary)",
    backgroundColor:
      "color-mix(in srgb, var(--color-primary) 10%, transparent)",
    borderRadius: "50%",
    width: 30,
    height: 30,
    display: "grid",
    placeItems: "center",
    transition: "transform 0.25s ease, background-color 0.2s ease",
  },
  "&:hover .MuiAccordionSummary-expandIconWrapper": {
    backgroundColor:
      "color-mix(in srgb, var(--color-primary) 20%, transparent)",
  },
};

/** Body of an expanded settings section. */
export const settingsAccordionDetailsSx: SxProps<Theme> = {
  px: { xs: 1.75, md: 2.25 },
  pt: 2,
  pb: 2.25,
  display: "flex",
  flexDirection: "column",
  gap: 1.75,
  borderTop:
    "1px solid color-mix(in srgb, var(--color-secondary) 16%, transparent)",
  backgroundColor:
    "color-mix(in srgb, var(--color-background) 34%, transparent)",
};

/** Headline value badge shown in a collapsed section header. */
export const settingsSummaryValueSx: SxProps<Theme> = {
  px: 1.25,
  py: 0.5,
  borderRadius: "10px",
  maxWidth: { xs: "100%", md: 340 },
  fontWeight: 800,
  fontSize: "0.86rem",
  lineHeight: 1.8,
  color: "var(--color-primary)",
  backgroundColor: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
  border: "1px solid color-mix(in srgb, var(--color-primary) 22%, transparent)",
  fontVariantNumeric: "tabular-nums",
  overflowWrap: "anywhere",
  textAlign: "start",
};

/** Table container used inside an expanded settings section. */
export const settingsSectionTableContainerSx: SxProps<Theme> = {
  mt: 0,
  borderRadius: "12px",
  boxShadow: "none",
  border:
    "1px solid color-mix(in srgb, var(--color-secondary) 18%, transparent)",
};

/** Table body used inside an expanded settings section. */
export const settingsSectionTableSx: SxProps<Theme> = {
  minWidth: 560,
  "& .MuiTableCell-root": { py: 1.15 },
};

/** Toolbar above the section list (expand/collapse all, refresh). */
export const settingsToolbarSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 1,
  mb: 1.75,
};

/** Vertical rhythm shared by every settings section stack. */
export const SETTINGS_SECTION_GAP = 2.25;
export const SETTINGS_CARD_GAP = 2;

/** Persian digits for user-facing counters and ordinals. */
export const toPersianDigits = (value: string | number) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
