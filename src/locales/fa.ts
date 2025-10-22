export const faMessages = {
  navigation: {
    dashboard: 'داشبورد',
    integratedStorage: 'فضای یکپارچه',
    fileStorage: 'فضای فایلی',
    sharing: 'اشتراک گذاری',
    services: 'سرویس ها',
    settings: 'تنظیمات',
  },
  errors: {
    network: 'اتصال به سرور برقرار نشد. لطفاً بعداً دوباره تلاش کنید.',
    timeout: 'پاسخ‌گویی سرویس بیش از حد طول کشید. لطفاً بعداً دوباره تلاش کنید.',
  },
} as const;

export type FaMessages = typeof faMessages;
