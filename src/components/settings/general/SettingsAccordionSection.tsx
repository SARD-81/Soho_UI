import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { MdExpandMore } from "react-icons/md";
import {
  settingsAccordionDetailsSx,
  settingsAccordionSummarySx,
  settingsAccordionSx,
  settingsSummaryValueSx,
} from "./styles";

export type SettingsBadgeColor =
  "default" | "primary" | "success" | "warning" | "info" | "error";

export interface SettingsSectionBadge {
  label: string;
  color?: SettingsBadgeColor;
}

export interface SettingsAccordionSectionProps {
  id: string;
  icon: ReactNode;
  /** Short section name, e.g. «ورژن». */
  title: string;
  /** Label of the headline value, e.g. «نسخه فعلی». */
  summaryLabel: string;
  /** Headline value shown on the closed header. */
  summaryValue: ReactNode;
  badges?: SettingsSectionBadge[];
  isLoading?: boolean;
  expanded: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
}

/**
 * Collapsible section shell of the general-settings tab.
 *
 * Header layout: icon + section name on the inline-start side, and a labelled
 * headline value plus optional status chips on the inline-end side. No long
 * helper text is rendered here on purpose; the section body carries the data.
 *
 * RTL note: the page is already `dir="rtl"` and emotion styles pass through
 * `stylis-plugin-rtl`, so only *logical* properties are used here. Never add
 * `direction`, `left`, `right` or `textAlign: 'right'` by hand.
 */
const SettingsAccordionSection = ({
  id,
  icon,
  title,
  summaryLabel,
  summaryValue,
  badges = [],
  isLoading = false,
  expanded,
  onToggle,
  children,
}: SettingsAccordionSectionProps) => {
  const panelId = `settings-section-${id}`;

  return (
    <Accordion
      disableGutters
      square={false}
      elevation={0}
      expanded={expanded}
      onChange={() => onToggle(id)}
      sx={settingsAccordionSx}
      slotProps={{ transition: { unmountOnExit: false } }}
    >
      <AccordionSummary
        id={`${panelId}-header`}
        aria-controls={`${panelId}-content`}
        expandIcon={<MdExpandMore size={22} />}
        sx={settingsAccordionSummarySx}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "stretch", md: "center" }}
          gap={{ xs: 1, md: 2 }}
          sx={{ width: "100%", minWidth: 0 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            gap={1.25}
            sx={{ minWidth: 0, flex: 1 }}
          >
            <Box
              aria-hidden
              sx={{
                width: 40,
                height: 40,
                flexShrink: 0,
                borderRadius: "12px",
                display: "grid",
                placeItems: "center",
                fontSize: 20,
                color: "var(--color-primary)",
                backgroundColor:
                  "color-mix(in srgb, var(--color-primary) 12%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--color-primary) 28%, transparent)",
              }}
            >
              {icon}
            </Box>

            <Typography
              component="h3"
              sx={{
                m: 0,
                minWidth: 0,
                fontWeight: 800,
                fontSize: "1.02rem",
                lineHeight: 1.9,
                color: "var(--color-text)",
                textAlign: "start",
              }}
            >
              {title}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{
              minWidth: 0,
              flexShrink: 0,
              flexWrap: "wrap",
              justifyContent: { xs: "flex-start", md: "flex-end" },
            }}
          >
            {badges.map((badge) => (
              <Chip
                key={badge.label}
                size="small"
                variant="outlined"
                label={badge.label}
                color={badge.color ?? "default"}
                sx={{ fontWeight: 700, fontSize: "0.72rem" }}
              />
            ))}

            <Typography
              sx={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "var(--color-secondary)",
                whiteSpace: "nowrap",
              }}
            >
              {summaryLabel}
            </Typography>

            {isLoading ? (
              <Skeleton
                variant="rounded"
                width={168}
                height={30}
                sx={{ borderRadius: "9px" }}
              />
            ) : (
              <Box sx={settingsSummaryValueSx}>{summaryValue}</Box>
            )}
          </Stack>
        </Stack>
      </AccordionSummary>

      <AccordionDetails
        id={`${panelId}-content`}
        sx={settingsAccordionDetailsSx}
      >
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

export default SettingsAccordionSection;
