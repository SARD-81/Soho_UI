import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
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
        sx={(theme) => ({
          mt: 2,
          borderRadius: theme.shape.borderRadius * 2,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          background: `linear-gradient(150deg, ${alpha(
            theme.palette.background.paper,
            0.96
          )}, ${alpha(theme.palette.background.default, 0.9)})`,
          boxShadow: theme.shadows[3],
        })}
      >
        <Box
          sx={(theme) => ({
            px: 2.5,
            pt: 2.5,
            pb: 1.5,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            background: `linear-gradient(140deg, ${alpha(
              theme.palette.primary.main,
              0.12
            )}, ${alpha(theme.palette.primary.light, 0.08)})`,
          })}
        >
          <ModernTabs value={activeTab} onChange={handleTabChange} variant="scrollable">
            {SETTINGS_TAB_ITEMS.map((tab) => (
              <ModernTab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </ModernTabs>
        </Box>

        <Box
          sx={(theme) => ({
            p: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
          })}
        >
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