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

  return (
    <Box
      sx={{
        mt: 2.5,
        p: { xs: 2, md: 2.75 },
        borderRadius: '16px',
        backgroundColor: 'var(--color-card-bg)',
        boxShadow:
          '0 22px 48px -32px rgba(0, 0, 0, 0.35), 0 1px 0 rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(0, 0, 0, 0.04)',
        backdropFilter: 'blur(6px)',
      }}
    >
      {children}
    </Box>
  );
};

export default TabPanel;
