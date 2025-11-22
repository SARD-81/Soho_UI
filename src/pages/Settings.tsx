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
import PageContainer from '../components/PageContainer';
import ChromeTabLabel from '../components/tabs/ChromeTabLabel';
import {
  tabContainerSx,
  tabListSx,
  tabPanelSx,
} from '../components/tabs/styles';

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

      <Box sx={tabContainerSx}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={tabListSx}>
          {SETTINGS_TAB_ITEMS.map((tab) => (
            <Tab
              key={tab.value}
              label={<ChromeTabLabel label={tab.label} />}
              value={tab.value}
            />
          ))}
        </Tabs>

        <Box sx={tabPanelSx}>
          <TabPanel
            value={SETTINGS_TABS.network}
            currentValue={activeTab}
            sx={{ mt: 0 }}
          >
            <NetworkSettingsTable />
          </TabPanel>

          <TabPanel
            value={SETTINGS_TABS.users}
            currentValue={activeTab}
            sx={{ mt: 0 }}
          >
            <UserSettingsTable />
          </TabPanel>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default Settings;