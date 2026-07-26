const SETTINGS_TABS = {
  general: 'general',
  network: 'network',
  users: 'users',
} as const;

type SettingsTabValue = (typeof SETTINGS_TABS)[keyof typeof SETTINGS_TABS];

const SETTINGS_TAB_ITEMS: Array<{
  label: string;
  value: SettingsTabValue;
  /** Short helper text shown under the page title for the active tab. */
  description: string;
}> = [
  {
    label: 'تنظیمات عمومی',
    value: SETTINGS_TABS.general,
    description: 'نام میزبان، منطقه زمانی و همگام‌سازی ساعت سامانه',
  },
  {
    label: 'تنظیمات شبکه',
    value: SETTINGS_TABS.network,
    description: 'پیکربندی رابط‌های شبکه، آدرس‌دهی و مسیریابی',
  },
  {
    label: 'تنظیمات کاربران',
    value: SETTINGS_TABS.users,
    description: 'مدیریت کاربران پنل مدیریت و سطوح دسترسی',
  },
];

/** Shared prefix used to link each tab with its panel for screen readers. */
const SETTINGS_TAB_ID_PREFIX = 'settings-tab';

export { SETTINGS_TABS, SETTINGS_TAB_ITEMS, SETTINGS_TAB_ID_PREFIX };
export type { SettingsTabValue };
