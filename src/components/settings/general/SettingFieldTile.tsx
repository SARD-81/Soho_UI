import { Box, Chip, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import Ltr from "./Ltr";
import { settingsFieldTileSx, settingsTileGridSx } from "./styles";
import type { SettingsBadgeColor } from "./SettingsAccordionSection";

export interface SettingFieldTileProps {
  label: string;
  value: ReactNode;
  /** Small explanation under the value. */
  hint?: ReactNode;
  /** Isolate the value as an LTR technical token (hostname, timestamp, IP). */
  ltr?: boolean;
  status?: { label: string; color?: SettingsBadgeColor };
  /** Edit / view buttons rendered at the end of the tile header. */
  action?: ReactNode;
  /** Make the tile span the whole grid row. */
  fullWidth?: boolean;
  /** Visually emphasise the tile (used for the live clock). */
  highlighted?: boolean;
}

/**
 * One read-only value of a settings section, with an optional inline edit
 * action. Presentation only — the panel owns the value and the action.
 */
export const SettingFieldTile = ({
  label,
  value,
  hint,
  ltr = false,
  status,
  action,
  fullWidth = false,
  highlighted = false,
}: SettingFieldTileProps) => (
  <Box
    sx={[
      settingsFieldTileSx,
      highlighted && {
        background:
          "linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 12%, var(--color-card-bg)) 0%, var(--color-card-bg) 100%)",
        borderColor:
          "color-mix(in srgb, var(--color-primary) 38%, transparent)",
      },
      fullWidth && { gridColumn: "1 / -1" },
    ]}
  >
    <Stack
      direction="row"
      alignItems="center"
      gap={1}
      sx={{ minWidth: 0, mb: 0.75 }}
    >
      <Typography
        component="span"
        sx={{
          flex: 1,
          minWidth: 0,
          fontSize: "0.76rem",
          fontWeight: 700,
          lineHeight: 1.8,
          color: "var(--color-secondary)",
          textAlign: "start",
        }}
      >
        {label}
      </Typography>

      {status ? (
        <Chip
          size="small"
          variant="outlined"
          label={status.label}
          color={status.color ?? "default"}
          sx={{ fontWeight: 700, fontSize: "0.68rem", height: 22 }}
        />
      ) : null}

      {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
    </Stack>

    <Typography
      component="div"
      sx={{
        minWidth: 0,
        fontWeight: 700,
        fontSize: highlighted ? "1.02rem" : "0.88rem",
        lineHeight: 1.9,
        color: "var(--color-text)",
        textAlign: "start",
        overflowWrap: "anywhere",
      }}
    >
      {ltr ? <Ltr>{value}</Ltr> : value}
    </Typography>

    {hint ? (
      <Typography
        sx={{
          mt: 0.5,
          fontSize: "0.72rem",
          lineHeight: 1.85,
          color: "var(--color-secondary)",
          textAlign: "start",
        }}
      >
        {hint}
      </Typography>
    ) : null}
  </Box>
);

/** Responsive grid that lays the tiles of one section out. */
export const SettingTileGrid = ({ children }: { children: ReactNode }) => (
  <Box sx={settingsTileGridSx}>{children}</Box>
);

export default SettingFieldTile;
