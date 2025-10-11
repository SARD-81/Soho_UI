export const SERVICE_LABELS: Record<string, string> = {
  smbd: 'Samba SMB Daemon',
  nmbd: 'Samba NMB Daemon',
  sshd: 'OpenSSH Server',
};

export const getServiceLabel = (
  serviceName: string,
  fallback?: string | null
) => SERVICE_LABELS[serviceName] ?? fallback ?? serviceName;
