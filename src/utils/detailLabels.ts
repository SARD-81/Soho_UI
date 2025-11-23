import { omitNullishEntries } from './detailValues';

const NORMALIZED_KEY_LABELS: Record<string, string> = {
  path: 'مسیر',
  'full path': 'مسیر کامل',
  fullpath: 'مسیر کامل',
  'full_path': 'مسیر کامل',
  'valid users': 'کاربران مجاز',
  valid_users: 'کاربران مجاز',
  'valid_users list': 'فهرست کاربران مجاز',
  'allowed hosts': 'میزبان‌های مجاز',
  'read only': 'فقط خواندنی',
  readonly: 'فقط خواندنی',
  browsable: 'قابل مرور',
  comment: 'توضیح',
  description: 'توضیحات',
  domain: 'دامنه',
  username: 'نام کاربری',
  user: 'کاربر',
  group: 'گروه',
  owner: 'مالک',
  mode: 'سطح دسترسی',
  profilepath: 'مسیر پروفایل',
  profile_path: 'مسیر پروفایل',
  profile: 'پروفایل',
  homedir: 'پوشه خانگی',
  home: 'خانه',
  kickofftime: 'زمان قطع دسترسی',
  kickoff_time: 'زمان قطع دسترسی',
  logofftime: 'زمان خروج',
  logoff_time: 'زمان خروج',
  logontime: 'زمان ورود',
  logon_time: 'زمان ورود',
  passwordmustchange: 'الزام تغییر رمز عبور',
  password_must_change: 'الزام تغییر رمز عبور',
  passwordlastset: 'آخرین زمان تنظیم رمز عبور',
  password_last_set: 'آخرین زمان تنظیم رمز عبور',
  passwordcanchange: 'زمان مجاز برای تغییر رمز عبور',
  password_can_change: 'زمان مجاز برای تغییر رمز عبور',
  sid: 'شناسه SID',
  guid: 'شناسه GUID',
  id: 'شناسه',
  name: 'نام',
  pool: 'فضای یکپارچه',
  poolname: 'نام فضای یکپارچه',
  state: 'وضعیت',
  status: 'وضعیت',
  health: 'سلامت',
  size: 'حجم',
  totalbytes: 'حجم کل',
  total_bytes: 'حجم کل',
  total: 'کل',
  used: 'استفاده‌شده',
  usedbytes: 'حجم استفاده‌شده',
  used_bytes: 'حجم استفاده‌شده',
  free: 'آزاد',
  freebytes: 'حجم آزاد',
  free_bytes: 'حجم آزاد',
  alloc: 'حجم تخصیص‌یافته',
  allocated: 'تخصیص‌یافته',
  capacity: 'ظرفیت',
  capacitypercent: 'درصد ظرفیت',
  capacity_percent: 'درصد ظرفیت',
  fragmentation: 'درصد تکه‌تکه شدن',
  fragmentationpercent: 'درصد تکه‌تکه شدن',
  fragmentation_percent: 'درصد تکه‌تکه شدن',
  dedup: 'رفع تکرار',
  deduplication: 'رفع تکرار',
  deduplicationratio: 'نرخ رفع تکرار',
  deduplication_ratio: 'نرخ رفع تکرار',
  version: 'نسخه',
  ashift: 'اندازه شیفت بلوک',
  altroot: 'ریشه جایگزین',
  autoexpand: 'گسترش خودکار',
  autoreplace: 'جایگزینی خودکار',
  failmode: 'حالت شکست',
  readonlyprop: 'ویژگی فقط خواندنی',
  'cachefile': 'فایل کش',
  'comment prop': 'ویژگی توضیح',
  encryption: 'رمزنگاری',
  checksum: 'چک‌سام',
  compression: 'فشرده‌سازی',
  mountpoint: 'نقطه مونت',
  mount_point: 'نقطه مونت',
  'raid mode': 'حالت RAID',
};

const WORD_TRANSLATIONS: Record<string, string> = {
  path: 'مسیر',
  full: 'کامل',
  valid: 'مجاز',
  users: 'کاربران',
  user: 'کاربر',
  allowed: 'مجاز',
  hosts: 'میزبان‌ها',
  read: 'خواندن',
  only: 'فقط',
  browsable: 'قابل مرور',
  comment: 'توضیح',
  description: 'توضیحات',
  domain: 'دامنه',
  profile: 'پروفایل',
  home: 'خانه',
  directory: 'شاخه',
  owner: 'مالک',
  group: 'گروه',
  mode: 'سطح دسترسی',
  password: 'رمز عبور',
  must: 'باید',
  change: 'تغییر',
  logon: 'ورود',
  logoff: 'خروج',
  kickoff: 'قطع دسترسی',
  time: 'زمان',
  last: 'آخرین',
  set: 'تنظیم',
  can: 'می‌تواند',
  name: 'نام',
  id: 'شناسه',
  state: 'وضعیت',
  status: 'وضعیت',
  health: 'سلامت',
  size: 'حجم',
  total: 'کل',
  used: 'استفاده‌شده',
  free: 'آزاد',
  bytes: 'بایت',
  capacity: 'ظرفیت',
  percent: 'درصد',
  fragmentation: 'تکه‌تکه شدن',
  deduplication: 'رفع تکرار',
  dedup: 'رفع تکرار',
  ratio: 'نسبت',
  version: 'نسخه',
  encryption: 'رمزنگاری',
  checksum: 'چک‌سام',
  compression: 'فشرده‌سازی',
  mount: 'مونت',
  point: 'نقطه',
  pool: 'فضای یکپارچه',
  disk: 'دیسک',
  type: 'نوع',
  guid: 'شناسه GUID',
};

const normalizeKey = (key: string) =>
  key
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase();

const translateViaWords = (normalizedKey: string) => {
  const translated = normalizedKey
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => WORD_TRANSLATIONS[word] ?? word)
    .join(' ')
    .trim();

  return translated.length > 0 ? translated : normalizedKey;
};

const translateKey = (key: string) => {
  const normalizedKey = normalizeKey(key);

  if (normalizedKey in NORMALIZED_KEY_LABELS) {
    return NORMALIZED_KEY_LABELS[normalizedKey];
  }

  return translateViaWords(normalizedKey);
};

export const localizeDetailEntries = (
  values: Record<string, unknown> | null | undefined
): Record<string, unknown> => {
  if (!values) {
    return {};
  }

  const sanitizedValues = omitNullishEntries(values);

  return Object.fromEntries(
    Object.entries(sanitizedValues).map(([key, value]) => [translateKey(key), value])
  );
};

