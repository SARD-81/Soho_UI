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
    'allocated',
    'free',
    'vdev_type',
    'capacity',
    'health',
    'fragmentation',
  ],
  sections: [
    {
      id: 'general',
      title: 'مشخصات کلی',
      keys: [
        'name',
        'size',
        'allocated',
        'free',
        'vdev_type',
        'capacity',
        'health',
        'fragmentation',
      ],
    },
    {
      id: 'settings',
      title: 'تنظیمات',
      keys: [
        'autotrim',
        'autoreplace',
        'multihost',
        'compatibility',
        'autoexpand',
        'listsnapshots',
      ],
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
    'نوع دیسک',
    'وضعیت',
    'حجم کل',
    'دمای فعلی',
    'مدل',
    'شناسه WWN',
    'حجم آزاد',
    'حجم استفاده‌شده',
    'درصد استفاده',
    'فروشنده',
    'مسیر دستگاه',
    'اندازه بلاک فیزیکی',
    'اندازه بلاک منطقی',
    'زمان‌بندی',
    'WWID',
    'UUID',
    'شماره اسلات',
  ],
  sections: [
    {
      id: 'general',
      title: 'مشخصات کلی',
      keys: [
        'نام دیسک',
        'نوع دیسک',
        'وضعیت',
        'حجم کل',
        'دمای فعلی',
        'مدل',
        'شناسه WWN',
        'فروشنده',
        'مسیر دستگاه',
        'اندازه بلاک فیزیکی',
        'اندازه بلاک منطقی',
        'زمان‌بندی',
        'WWID',
        'شماره اسلات',
        'حجم آزاد',
        'حجم استفاده‌شده',
        'درصد استفاده',
        'UUID',
      ],
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