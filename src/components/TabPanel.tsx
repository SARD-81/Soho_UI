import { Box, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';

type TabValue = string | number;

interface TabPanelProps<Value extends TabValue> {
  value: Value;
  currentValue: Value;
  children: ReactNode;
  sx?: SxProps<Theme>;
  /** Shared prefix used to link the panel with its tab for screen readers. */
  idPrefix?: string;
}

/**
 * Accessible tab panel: exposes `role="tabpanel"` and is linked back to its
 * tab through `id` / `aria-labelledby`, so assistive technology announces the
 * active section correctly.
 */
const TabPanel = <Value extends TabValue>({
  value,
  currentValue,
  children,
  sx,
  idPrefix = 'tab',
}: TabPanelProps<Value>) => {
  const isActive = value === currentValue;

  if (!isActive) {
    return null;
  }

  return (
    <Box
      role="tabpanel"
      id={`${idPrefix}-panel-${value}`}
      aria-labelledby={`${idPrefix}-${value}`}
      tabIndex={0}
      sx={{ mt: 3, outline: 'none', ...sx }}
    >
      {children}
    </Box>
  );
};

export default TabPanel;
