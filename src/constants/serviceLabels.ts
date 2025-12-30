export const SERVICE_LABELS: Record<string, string> = {
  "networking.service": 'سرویس شبکه',
  "nginx.service": 'وب سرور',
  "smbd.service": 'سرویس اشتراک فایلی',
  "soho_core_api.service": 'سرویس هسته سوهو',
  "ssh.service": 'دسترسی ریموت',
  "snmpd.service" : 'سرویس SNMP',
};

export const getServiceLabel = (
  serviceName: string,
  fallback?: string | null
) => SERVICE_LABELS[serviceName] ?? fallback ?? serviceName;