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
  includedKeys?: string[];
}

export const POOL_DETAIL_LAYOUT: DetailLayoutConfig = {
  comparisonPriority: ['name', 'guid', 'health'],
  excludedKeys: [
    'size',
    'free',
    'allocated',
    'capacity',
    'vdev_type',
    'درصد تکه‌تکه شدن',
    'altroot',
    'اندازه شیفت بلوک',
    'تعداد نسخه‌های رفع تکرار',
    'ashift',
    'تفویض اختیار',
    'گسترش خودکار',
    'جایگزینی خودکار',
    'برش خودکار',
    'bootfs',
    'cachefile',
    'فضای تخصیص‌یافته',
    'ظرفیت',
    'checkpoint',
    'نسبت رفع تکرار',
    'comment', //in mored nokte darad
    'سازگاری',
    'dedupditto',
    'dedupratio',
    'delegation',
    'expandsize',
    'حالت شکست',
    'free',
    'در حال آزادسازی',
    // 'شناسه شناسه GUID',
    'نشتی',
    'نمایش اسنپ‌شات‌ها',
    'load شناسه شناسه GUID',
    'حداکثر اندازه بلاک',
    'حداکثر اندازه dnode',
    'چندمیزبانی',
    'فقط خواندنی',
    'fragmentation',
    'tname',
    'vdev نوع',
    'version',
    'load guid',
  ],
  sections: [
    {
      id: 'general',
      title: 'مشخصات کلی',
      keys: ['name', 'guid', 'health'],
    },
    // {
    //   id: 'settings',
    //   title: 'تنظیمات',
    //   keys: [
    //     'autoexpand',
    //     'autoreplace',
    //     'autotrim',
    //     'multihost',
    //     'listsnapshots',
    //   ],
    //   optional: true,
    // },
    // {
    //   id: 'identifiers',
    //   title: 'شناسه‌ها',
    //   keys: ['load_guid'],
    //   optional: true,
    // },
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
  excludedKeys: [
    'حجم آزاد',
    'زمان‌بندی',
    'درصد استفاده',
    'حجم استفاده‌شده',
    'UUID',
    'WWID',
    'مسیر دستگاه',
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

export const FILESYSTEM_DETAIL_LAYOUT: DetailLayoutConfig = {
  includedKeys: [
    'نام فضا',
    'Pool',
    'mountpoint',
    'type',
    'creation',
    'used',
    'available',
    'quota',
    'reservation',
    'mounted',
    'canmount',
    'readonly',
    'sharesmb',
    'sharenfs',
    'encryption',
    'keystatus',
    'keyformat',
    'compression',
    'compressratio',
    'recordsize',
  ],
  comparisonPriority: [
    'نام فضا',
    'Pool',
    'mountpoint',
    'used',
    'available',
    'quota',
    'reservation',
    'mounted',
    'canmount',
    'readonly',
    'encryption',
    'keystatus',
    'sharesmb',
    'sharenfs',
    'compression',
    'compressratio',
    'recordsize',
    'creation',
    'type',
  ],
  sections: [
    {
      id: 'general',
      title: 'مشخصات کلی',
      keys: ['نام فضا', 'Pool', 'mountpoint', 'type', 'creation'],
    },
    {
      id: 'capacity',
      title: 'ظرفیت و مصرف',
      keys: ['used', 'available', 'quota', 'reservation'],
      optional: true,
    },
    {
      id: 'state',
      title: 'وضعیت و دسترسی',
      keys: ['mounted', 'canmount', 'readonly', 'sharesmb', 'sharenfs'],
      optional: true,
    },
    {
      id: 'encryption',
      title: 'رمزنگاری',
      keys: ['encryption', 'keystatus', 'keyformat'],
      optional: true,
    },
    {
      id: 'behavior',
      title: 'رفتار ذخیره‌سازی',
      keys: ['compression', 'compressratio', 'recordsize'],
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
    'read_only',
    'read only',
    'browseable',
    'create_mask',
    'create mask',
    'directory_mask',
    'directory mask',
    'max_connections',
    'max connections',
    'created_time',
  ],
  excludedKeys: [
    'is_custom',
    'inherit permissions',
    'inherit_permissions',
    'guest ok',
    'guest_ok',
  ],
  sections: [
    {
      id: 'general',
      title: 'مشخصات کلی',
      keys: [
        'path',
        'full_path',
        'is_custom',
        'created_time',
        'valid_users',
        'valid users',
        'valid_groups',
        'valid groups',
        'available',
        'read_only',
        'read only',
        'browseable',
      ],
    },
    {
      id: 'limits',
      title: 'محدودیت‌ها',
      keys: [
        'max_connections',
        'max connections',
        'create_mask',
        'create mask',
        'directory_mask',
        'directory mask',
      ],
      optional: true,
    },
  ],
};

export const NFS_SHARE_DETAIL_LAYOUT: DetailLayoutConfig = {
  comparisonPriority: ['path', 'clients', 'options'],
  excludedKeys: [],
  sections: [
    {
      id: 'general',
      title: 'مشخصات کلی',
      keys: ['path', 'clients'],
    },
    {
      id: 'options',
      title: 'تنظیمات',
      keys: ['options'],
      optional: true,
    },
  ],
};

export const SNMP_DETAIL_LAYOUT: DetailLayoutConfig = {
  comparisonPriority: [
    'community',
    'allowed_ips',
    'enabled',
    'version',
    'port',
    'bind_ip',
    'contact',
    'location',
    'sys_name',
  ],
  excludedKeys: [],
  sections: [
    {
      id: 'general',
      title: 'مشخصات کلی',
      keys: ['community', 'enabled', 'version', 'sys_name'],
    },
    {
      id: 'network',
      title: 'شبکه',
      keys: ['allowed_ips', 'port', 'bind_ip'],
      optional: true,
    },
    {
      id: 'meta',
      title: 'اطلاعات تکمیلی',
      keys: ['contact', 'location'],
      optional: true,
    },
  ],
};

export const SAMBA_USER_DETAIL_LAYOUT: DetailLayoutConfig = {
  comparisonPriority: [
    'Unix username',
    'Domain',
    'Account Flags',

    'Home Directory',
    'Profile Path',
    'Full Name',

    'Password last set',
  ],
  excludedKeys: [
    'Password can change',
    'Password must change',
    'Last bad password',
    'Bad password count',
    'Logon hours',
    'Logon time',
    'Logoff time',
    'Kickoff time',
    'User SID',
    'Primary Group SID',
  ],
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
