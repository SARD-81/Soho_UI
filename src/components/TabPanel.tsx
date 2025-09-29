import { Box } from '@mui/material';
import type { ReactNode } from 'react';

type TabValue = string | number;

interface TabPanelProps<Value extends TabValue> {
  value: Value;
  currentValue: Value;
  children: ReactNode;
}

const TabPanel = <Value extends TabValue>({
  value,
  currentValue,
  children,
}: TabPanelProps<Value>) => {
  if (value !== currentValue) {
    return null;
  }

  return <Box sx={{ mt: 3 }}>{children}</Box>;
};

export default TabPanel;
