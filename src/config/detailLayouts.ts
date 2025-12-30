export interface DetailSectionConfig {
  id: string;
  title: string;
  keys: string[];
  optional?: boolean;
}

export interface DetailLayoutConfig {
  sections: DetailSectionConfig[];
  comparisonPriority: string[];
  excludedKeys?: string[];
}

export const POOL_DETAIL_LAYOUT: DetailLayoutConfig = {
  comparisonPriority: [
    'name',
    'size',
    'free',
    'allocated',
    'capacity',
    'health',
    'vdev_type',
    'fragmentation',
  ],
  excludedKeys: [],
  sections: [
    {
      id: 'general',
      title: 'مشخصات کلی',
      keys: [
        'name',
        'size',
        'free',
        'allocated',
        'capacity',
        'health',
        'vdev_type',
        'fragmentation',
        'failmode'
      ],
    },
    {
      id: 'settings',
      title: 'تنظیمات',
      keys: ['autoexpand', 'autoreplace', 'autotrim', 'multihost', "listsnapshots"],
      optional: true,
    },
    {
      id: 'identifiers',
      title: 'شناسه‌ها',
      keys: ['guid', 'load_guid'],
      optional: true,
    },
    {
      id: 'devices',
      title: 'دیسک‌ها',
      keys: ['disks'],
      optional: true,
    },
  ],
};

export const DISK_DETAIL_LAYOUT: DetailLayoutConfig = {
  comparisonPriority: [
    'نام دیسک',
    'مدل',
    'نوع دیسک',
    'وضعیت',
    'حجم کل',
    'حجم آزاد',
    'حجم استفاده‌شده',
    'درصد استفاده',
  ],
  excludedKeys: [],
  sections: [
    {
      id: 'general',
      title: 'مشخصات کلی',
      keys: [
        'نام دیسک',
        'مدل',
        'فروشنده',
        'نوع دیسک',
        'وضعیت',
        'حجم کل',
        'حجم آزاد',
        'حجم استفاده‌شده',
        'درصد استفاده',
      ],
    },
    {
      id: 'hardware',
      title: 'تنظیمات',
      keys: [
        'مسیر دستگاه',
        'اندازه بلاک فیزیکی',
        'اندازه بلاک منطقی',
        'زمان‌بندی',
        'WWID',
        'شناسه WWN',
        'شماره اسلات',
      ],
      optional: true,
    },
    {
      id: 'partitions',
      title: 'پارتیشن‌ها',
      keys: ['دارای پارتیشن', 'پارتیشن‌ها'],
      optional: true,
    },
  ],
};

export const SHARE_DETAIL_LAYOUT: DetailLayoutConfig = {
  comparisonPriority: [
    'path',
    'full_path',
    'valid_users',
    'valid users',
    'valid_groups',
    'valid groups',
    'available',
    'read only',
    'browseable',
    'guest ok',
    'inherit permissions',
    'create mask',
    'directory mask',
    'max connections',
    'is_custom',
    'created_time',
  ],
  excludedKeys: [],
  sections: [
    {
      id: 'general',
      title: 'مشخصات کلی',
      keys: ['path', 'full_path', 'is_custom', 'created_time'],
    },
    {
      id: 'access',
      title: 'دسترسی',
      keys: [
        'valid_users',
        'valid users',
        'valid_groups',
        'valid groups',
        'available',
        'read only',
        'guest ok',
        'browseable',
        'inherit permissions',
      ],
    },
    {
      id: 'limits',
      title: 'محدودیت‌ها',
      keys: ['max connections', 'create mask', 'directory mask'],
      optional: true,
    },
  ],
};

export const SAMBA_USER_DETAIL_LAYOUT: DetailLayoutConfig = {
  comparisonPriority: [
    'Unix username',
    'Domain',
    'Account Flags',
    'User SID',
    'Primary Group SID',
    'Home Directory',
    'Profile Path',
    'Full Name',
    'Logon time',
    'Logoff time',
    'Kickoff time',
    'Password last set',
    'Password can change',
    'Password must change',
    'Last bad password',
    'Bad password count',
    'Logon hours',
  ],
  excludedKeys: [],
  sections: [
    {
      id: 'general',
      title: 'مشخصات کلی',
      keys: [
        'Unix username',
        'Domain',
        'Account Flags',
        'User SID',
        'Primary Group SID',
        'Home Directory',
        'Profile Path',
        'Full Name',
        'Logon time',
        'Logoff time',
        'Kickoff time',
        'Password last set',
        'Password can change',
        'Password must change',
        'Last bad password',
        'Bad password count',
        'Logon hours',
      ],
    },
  ],
};

export const FILESYSTEM_DETAIL_LAYOUT: DetailLayoutConfig = {
  comparisonPriority: ['نام فضا', 'Pool', 'mountpoint'],
  excludedKeys: [],
  sections: [
    {
      id: 'general',
      title: 'مشخصات کلی',
      keys: ['نام فضا', 'Pool', 'mountpoint'],
    },
  ],
};