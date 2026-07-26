import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import {
  type ReactElement,
  type SyntheticEvent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  MdLan,
  MdOutlineSettings,
  MdPeopleOutline,
  MdTune,
} from 'react-icons/md';
import PageContainer from '../components/PageContainer';
import TabPanel from '../components/TabPanel';
import GeneralSettingsPanel from '../components/settings/GeneralSettingsPanel';
import NetworkSettingsTable from '../components/settings/NetworkSettingsTable';
import UserSettingsTable from '../components/settings/UserSettingsTable';
import {
  tabContainerSx,
  tabListSx,
  tabPanelSx,
} from '../components/tabs/styles';
import {
  SETTINGS_TABS,
  SETTINGS_TAB_ID_PREFIX,
  SETTINGS_TAB_ITEMS,
  type SettingsTabValue,
} from '../constants/settings';

const TAB_ICONS: Record<SettingsTabValue, ReactElement> = {
  [SETTINGS_TABS.general]: <MdTune size={18} />,
  [SETTINGS_TABS.network]: <MdLan size={18} />,
  [SETTINGS_TABS.users]: <MdPeopleOutline size={18} />,
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTabValue>(
    SETTINGS_TABS.general
  );

  const handleTabChange = useCallback(
    (_: SyntheticEvent, value: SettingsTabValue) => {
      setActiveTab(value);
    },
    []
  );

  const activeTabDescription = useMemo(
    () =>
      SETTINGS_TAB_ITEMS.find((tab) => tab.value === activeTab)?.description ??
      '',
    [activeTab]
  );

  return (
    // `dir` is an HTML attribute, so `stylis-plugin-rtl` cannot mirror it.
    // Setting it here keeps every tab panel (and every table inside) RTL.
    <PageContainer
      sx={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
      }}
    >
      <Box dir="rtl" sx={{ width: '100%' }}>
        <Stack
          direction="row"
          alignItems="center"
          gap={1.5}
          sx={{ mb: 0.5, minWidth: 0 }}
        >
          <Box
            aria-hidden
            sx={{
              width: 44,
              height: 44,
              borderRadius: '13px',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              color: 'var(--color-primary)',
              backgroundColor:
                'color-mix(in srgb, var(--color-primary) 12%, transparent)',
              border:
                '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
            }}
          >
            <MdOutlineSettings size={24} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="h1"
              sx={{
                m: 0,
                color: 'var(--color-primary)',
                fontWeight: 800,
                fontSize: '1.35rem',
                lineHeight: 1.7,
              }}
            >
              تنظیمات
            </Typography>
            <Typography
              sx={{
                color: 'var(--color-secondary)',
                fontSize: '0.82rem',
                lineHeight: 1.9,
              }}
            >
              {activeTabDescription}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ ...tabContainerSx, mt: 2.25 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="بخش‌های تنظیمات"
            sx={tabListSx}
          >
            {SETTINGS_TAB_ITEMS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                icon={TAB_ICONS[tab.value]}
                iconPosition="start"
                id={`${SETTINGS_TAB_ID_PREFIX}-${tab.value}`}
                aria-controls={`${SETTINGS_TAB_ID_PREFIX}-panel-${tab.value}`}
              />
            ))}
          </Tabs>

          <Box sx={tabPanelSx}>
            <TabPanel
              value={SETTINGS_TABS.general}
              currentValue={activeTab}
              idPrefix={SETTINGS_TAB_ID_PREFIX}
              sx={{ mt: 0 }}
            >
              <GeneralSettingsPanel />
            </TabPanel>

            <TabPanel
              value={SETTINGS_TABS.network}
              currentValue={activeTab}
              idPrefix={SETTINGS_TAB_ID_PREFIX}
              sx={{ mt: 0 }}
            >
              <NetworkSettingsTable />
            </TabPanel>

            <TabPanel
              value={SETTINGS_TABS.users}
              currentValue={activeTab}
              idPrefix={SETTINGS_TAB_ID_PREFIX}
              sx={{ mt: 0 }}
            >
              <UserSettingsTable />
            </TabPanel>
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default Settings;
