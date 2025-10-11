export const SERVICE_LABELS: Record<string, string> = {
  "networking.service": 'سرویس شبکه',
  "nginx.service": 'ان‌جین‌ایکس',
  "smbd.service": 'سرویس اشتراک فایلی',
  "soho_core_api.service": 'سرویس هسته سوهو',
  "ssh.service": 'اس اس اچ',
};

export const getServiceLabel = (
  serviceName: string,
  fallback?: string | null
) => SERVICE_LABELS[serviceName] ?? fallback ?? serviceName;