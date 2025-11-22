import { Box, Tab, Tabs, type SxProps, type TabsProps, type Theme } from '@mui/material';
import type { SyntheticEvent } from 'react';

type TabValue = string | number;

interface TabNavigationProps<Value extends TabValue> {
  value: Value;
  onChange: (_event: SyntheticEvent, value: Value) => void;
  items: Array<{ label: string; value: Value }>;
  containerSx?: SxProps<Theme>;
  tabsProps?: Omit<TabsProps, 'value' | 'onChange' | 'children'>;
}

const TabNavigation = <Value extends TabValue>({
  value,
  onChange,
  items,
  containerSx,
  tabsProps,
}: TabNavigationProps<Value>) => {
  const { sx: tabsSx, ...restTabsProps } = tabsProps ?? {};

  return (
    <Box
      sx={{
        mt: 2,
        mb: 1.5,
        p: { xs: 1, md: 1.25 },
        borderRadius: '16px',
        background:
          'linear-gradient(135deg, rgba(0, 198, 169, 0.12) 0%, rgba(35, 167, 213, 0.08) 100%)',
        boxShadow:
          '0 18px 45px -28px rgba(0, 0, 0, 0.35), 0 12px 30px -20px rgba(0, 198, 169, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        ...containerSx,
      }}
    >
      <Tabs
        value={value}
        onChange={onChange}
        variant="scrollable"
        allowScrollButtonsMobile
        TabIndicatorProps={{ sx: { display: 'none' } }}
        sx={[
          {
            minHeight: 56,
            '& .MuiTabs-flexContainer': {
              gap: 1,
            },
            '& .MuiTab-root': {
              minHeight: 48,
              minWidth: 120,
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              color: 'var(--color-secondary)',
              fontWeight: 700,
              letterSpacing: '0.01em',
              boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.2s ease',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                boxShadow: '0 12px 28px -16px rgba(0, 0, 0, 0.25)',
              },
              '&.Mui-selected': {
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-primary)',
                boxShadow:
                  '0 14px 26px -16px rgba(0, 198, 169, 0.45), 0 1px 0 rgba(255, 255, 255, 0.4)',
                transform: 'translateY(-1px)',
              },
            },
          },
          tabsSx,
        ]}
        {...restTabsProps}
      >
        {items.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>
    </Box>
  );
};

export default TabNavigation;
