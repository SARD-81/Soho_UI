import { Typography } from '@mui/material';
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
import TabNavigation from '../components/TabNavigation';

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

      <TabNavigation
        value={activeTab}
        onChange={handleTabChange}
        items={SETTINGS_TAB_ITEMS}
      />

      <TabPanel value={SETTINGS_TABS.network} currentValue={activeTab}>
        <NetworkSettingsTable />
      </TabPanel>

      <TabPanel value={SETTINGS_TABS.users} currentValue={activeTab}>
        <UserSettingsTable />
      </TabPanel>
    </PageContainer>
  );
};

export default Settings;