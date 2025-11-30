export interface DetailSectionConfig {
  id: string;
  title: string;
  keys: string[];
  optional?: boolean;
}

export interface DetailLayoutConfig {
  sections: DetailSectionConfig[];
  comparisonPriority: string[];
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
      ],
    },
    {
      id: 'settings',
      title: 'تنظیمات',
      keys: ['autoexpand', 'autoreplace', 'autotrim', 'multihost', 'failmode'],
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
  comparisonPriority: ['path', 'full_path', 'valid_users', 'valid users'],
  sections: [
    {
      id: 'general',
      title: 'مشخصات کلی',
      keys: ['path', 'full_path', 'valid_users', 'valid users'],
    },
  ],
};

export const SAMBA_USER_DETAIL_LAYOUT: DetailLayoutConfig = {
  comparisonPriority: [
    'domain',
    'profilePath',
    'passwordMustChange',
    'logonTime',
    'logoffTime',
    'kickoffTime',
    'passwordLastSet',
    'passwordCanChange',
  ],
  sections: [
    {
      id: 'general',
      title: 'مشخصات کلی',
      keys: [
        'domain',
        'profilePath',
        'passwordMustChange',
        'logonTime',
        'logoffTime',
        'kickoffTime',
        'passwordLastSet',
        'passwordCanChange',
      ],
    },
  ],
};

export const FILESYSTEM_DETAIL_LAYOUT: DetailLayoutConfig = {
  comparisonPriority: ['نام فضا', 'Pool', 'mountpoint'],
  sections: [
    {
      id: 'general',
      title: 'مشخصات کلی',
      keys: ['نام فضا', 'Pool', 'mountpoint'],
    },
  ],
};
