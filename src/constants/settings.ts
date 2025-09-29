const SETTINGS_TABS = {
  network: 'network',
  users: 'users',
} as const;

type SettingsTabValue = (typeof SETTINGS_TABS)[keyof typeof SETTINGS_TABS];

const SETTINGS_TAB_ITEMS: Array<{ label: string; value: SettingsTabValue }> = [
  { label: 'تنظیمات شبکه', value: SETTINGS_TABS.network },
  { label: 'تنظیمات کاربران', value: SETTINGS_TABS.users },
];

export { SETTINGS_TAB_ITEMS, SETTINGS_TABS };
export type { SettingsTabValue };
