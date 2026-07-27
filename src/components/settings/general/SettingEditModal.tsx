import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import BlurModal from "../../BlurModal";
import {
  settingsAlertSx as alertSx,
  settingsOutlinedButtonSx as outlinedButtonSx,
  settingsPrimaryButtonSx as primaryButtonSx,
} from "./styles";

export interface SettingEditModalProps {
  open: boolean;
  title: string;
  description?: string;
  icon?: ReactNode;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  submitLabel?: string;
  /** Rows that only expose direct actions (no form) hide the submit button. */
  hideSubmit?: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  children: ReactNode;
}

/**
 * Shared editing shell for a single row of the general-settings table.
 * Pure presentation: it never owns form state, validation or mutations.
 */
const SettingEditModal = ({
  open,
  title,
  description,
  icon,
  errorMessage,
  isSubmitting = false,
  submitLabel = "ثبت تغییرات",
  hideSubmit = false,
  onClose,
  onSubmit,
  children,
}: SettingEditModalProps) => {
  return (
    <BlurModal
      open={open}
      onClose={onClose}
      closeDisabled={isSubmitting}
      direction="rtl"
      minWidth="min(620px, calc(100vw - 32px))"
      maxWidth="620px"
      title={
        <Stack
          direction="row"
          alignItems="center"
          gap={1.25}
          sx={{ minWidth: 0 }}
        >
          {icon ? (
            <Box
              aria-hidden
              sx={{
                width: 42,
                height: 42,
                flexShrink: 0,
                borderRadius: "12px",
                display: "grid",
                placeItems: "center",
                fontSize: 22,
                color: "var(--color-primary)",
                backgroundColor:
                  "color-mix(in srgb, var(--color-primary) 12%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--color-primary) 24%, transparent)",
              }}
            >
              {icon}
            </Box>
          ) : null}

          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="h2"
              sx={{
                fontWeight: 700,
                fontSize: "1.05rem",
                color: "var(--color-text)",
              }}
            >
              {title}
            </Typography>
            {description ? (
              <Typography
                sx={{
                  mt: 0.25,
                  fontSize: "0.8rem",
                  lineHeight: 1.7,
                  color: "var(--color-secondary)",
                }}
              >
                {description}
              </Typography>
            ) : null}
          </Box>
        </Stack>
      }
      actions={
        <>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isSubmitting}
            sx={outlinedButtonSx}
          >
            انصراف
          </Button>
          {hideSubmit ? null : (
            <Button
              variant="contained"
              onClick={onSubmit}
              disabled={isSubmitting}
              sx={primaryButtonSx}
            >
              {submitLabel}
            </Button>
          )}
        </>
      }
    >
      {errorMessage ? (
        <Alert severity="error" sx={alertSx}>
          {errorMessage}
        </Alert>
      ) : null}

      {children}
    </BlurModal>
  );
};

export default SettingEditModal;
