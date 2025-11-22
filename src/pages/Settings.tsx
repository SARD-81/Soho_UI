import { Box, Typography } from '@mui/material';
import { type SyntheticEvent, useCallback, useState } from 'react';
import TabPanel from '../components/TabPanel';
import NetworkSettingsTable from '../components/settings/NetworkSettingsTable';
import UserSettingsTable from '../components/settings/UserSettingsTable';
import {
  SETTINGS_TAB_ITEMS,
  SETTINGS_TABS,
  type SettingsTabValue,
} from '../constants/settings';
import PageContainer from '../components/PageContainer';
import { ModernTab, ModernTabs } from '../components/ModernTabs';

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
    <PageContainer sx={{ backgroundColor: 'var(--color-background)' }}>
      <Typography
        variant="h5"
        sx={{ color: 'var(--color-primary)', fontWeight: 700 }}
      >
        تنظیمات
      </Typography>

      <Box
        sx={{
          mt: 2,
          borderRadius: 18,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          background:
            'linear-gradient(160deg, rgba(13, 26, 45, 0.9), rgba(8, 16, 30, 0.85))',
          boxShadow:
            '0 18px 40px -22px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <Box
          sx={{
            px: 2.5,
            pt: 2.5,
            pb: 1.5,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background:
              'linear-gradient(145deg, rgba(21, 38, 65, 0.85), rgba(18, 34, 58, 0.7))',
          }}
        >
          <ModernTabs value={activeTab} onChange={handleTabChange} variant="scrollable">
            {SETTINGS_TAB_ITEMS.map((tab) => (
              <ModernTab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </ModernTabs>
        </Box>

        <Box sx={{ p: 3, backgroundColor: 'rgba(6, 12, 24, 0.8)' }}>
          <TabPanel
            value={SETTINGS_TABS.network}
            currentValue={activeTab}
            disableSpacing
          >
            <NetworkSettingsTable />
          </TabPanel>

          <TabPanel
            value={SETTINGS_TABS.users}
            currentValue={activeTab}
            disableSpacing
          >
            <UserSettingsTable />
          </TabPanel>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default Settings;