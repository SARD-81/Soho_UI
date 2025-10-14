import { Box, Tab, Tabs, Typography } from '@mui/material';
import { type SyntheticEvent, useCallback, useState } from 'react';
import TabPanel from '../components/TabPanel';
import NetworkSettingsTable from '../components/settings/NetworkSettingsTable';
import UserSettingsTable from '../components/settings/UserSettingsTable';
import {
  SETTINGS_TAB_ITEMS,
  SETTINGS_TABS,
  type SettingsTabValue,
} from '../constants/settings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTabValue>(
    SETTINGS_TABS.network
  );

  const handleTabChange = useCallback(
    (_: SyntheticEvent, value: SettingsTabValue) => {
      setActiveTab(value);
    },
    []
  );

  return (
    <Box
      sx={{
        p: 3,
        fontFamily: 'var(--font-vazir)',
        backgroundColor: 'var(--color-background)',
        minHeight: '100%',
      }}
    >
      <Typography
        variant="h5"
        sx={{ color: 'var(--color-primary)', fontWeight: 700 }}
      >
        تنظیمات
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          mt: 2,
          '& .MuiTab-root': {
            color: 'var(--color-secondary)',
            fontWeight: 600,
            '&.Mui-selected': {
              color: 'var(--color-primary)',
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: 'var(--color-primary)',
          },
        }}
      >
        {SETTINGS_TAB_ITEMS.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>

      <TabPanel value={SETTINGS_TABS.network} currentValue={activeTab}>
        <NetworkSettingsTable />
      </TabPanel>

      <TabPanel value={SETTINGS_TABS.users} currentValue={activeTab}>
        <UserSettingsTable />
      </TabPanel>
    </Box>
  );
};

export default Settings;