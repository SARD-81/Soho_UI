export const DEFAULT_LOGIN_SHELL = '/usr/sbin/nologin';

export const USERS_TABS = {
  os: 'os-users',
  samba: 'samba-users',
  other: 'other-users',
} as const;

type UsersTabKeys = keyof typeof USERS_TABS;

export type UsersTabValue = typeof USERS_TABS[UsersTabKeys];
