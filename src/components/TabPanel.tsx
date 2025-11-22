import { Box, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';

type TabValue = string | number;

interface TabPanelProps<Value extends TabValue> {
  value: Value;
  currentValue: Value;
  children: ReactNode;
  sx?: SxProps<Theme>;
  disableSpacing?: boolean;
}

const TabPanel = <Value extends TabValue>({
  value,
  currentValue,
  children,
  sx,
  disableSpacing = false,
}: TabPanelProps<Value>) => {
  if (value !== currentValue) {
    return null;
  }

  return <Box sx={{ mt: disableSpacing ? 0 : 3, ...sx }}>{children}</Box>;
};

export default TabPanel;
