import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import type { ReactNode } from 'react';
import {
  MdAdminPanelSettings,
  MdCheckCircle,
  MdDns,
  MdLan,
  MdLocationOn,
  MdOutlineError,
  MdSecurity,
  MdSettingsEthernet,
  MdShield,
  MdWarning,
} from 'react-icons/md';
import type { SxProps, Theme } from '@mui/material/styles';
import type { SnmpInfoData } from '../../@types/snmp';

interface SnmpOverviewProps {
  data?: SnmpInfoData;
  isLoading: boolean;
  error: Error | null;
}

type HealthTone = 'success' | 'warning' | 'error' | 'neutral';

interface MetricCardItem {
  id: string;
  label: string;
  value: ReactNode;
  helper: string;
  icon: ReactNode;
  tone: HealthTone;
}

interface ChecklistItem {
  id: string;
  label: string;
  passed: boolean;
  helper: string;
}

const normalizeText = (value: unknown) => String(value ?? '').trim();

const hasValue = (value: unknown) => normalizeText(value).length > 0;

const maskCommunity = (community?: string) => {
  const normalized = normalizeText(community);

  if (!normalized) {
    return '—';
  }

  if (normalized.length <= 3) {
    return '•••';
  }

  return `${normalized.slice(0, 2)}${'•'.repeat(Math.min(normalized.length - 2, 10))}`;
};

const isOpenBindAddress = (bindIp?: string) => {
  const normalized = normalizeText(bindIp);
  return normalized === '0.0.0.0' || normalized === '::' || normalized === '*';
};

const isSnmpV3 = (version?: string) =>
  normalizeText(version).toLowerCase().includes('3');

const getToneColor = (theme: Theme, tone: HealthTone) => {
  if (tone === 'success') {
    return theme.palette.success.main;
  }

  if (tone === 'warning') {
    return theme.palette.warning.main;
  }

  if (tone === 'error') {
    return theme.palette.error.main;
  }

  return theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b';
};

const createPanelSx = (theme: Theme): SxProps<Theme> => {
  const borderColor =
    theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.09)'
      : 'rgba(15,23,42,0.08)';

  return {
    borderRadius: '12px',
    border: `1px solid ${borderColor}`,
    background:
      theme.palette.mode === 'dark'
        ? 'linear-gradient(145deg, rgba(15,23,42,0.72), rgba(30,41,59,0.38))'
        : 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(248,250,252,0.82))',
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 22px 48px -34px rgba(0,0,0,0.85)'
        : '0 22px 48px -34px rgba(15,23,42,0.28)',
    backdropFilter: 'blur(14px)',
  };
};

const MetricCard = ({ item }: { item: MetricCardItem }) => {
  const theme = useTheme();
  const toneColor = getToneColor(theme, item.tone);

  return (
    <Card
      elevation={0}
      sx={{
        ...createPanelSx(theme),
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        '&::before': {
          content: '""',
          position: 'absolute',
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: toneColor,
          opacity: 0.9,
        },
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                display: 'grid',
                placeItems: 'center',
                color: toneColor,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.045)'
                    : 'rgba(15,23,42,0.035)',
                border: `1px solid ${toneColor}33`,
              }}
            >
              {item.icon}
            </Box>

            <Chip
              label={item.tone === 'success' ? 'OK' : item.tone === 'warning' ? 'Warning' : item.tone === 'error' ? 'Risk' : 'Info'}
              size="small"
              sx={{
                fontWeight: 800,
                color: toneColor,
                borderColor: `${toneColor}66`,
                backgroundColor: `${toneColor}14`,
              }}
              variant="outlined"
            />
          </Stack>

          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'var(--color-secondary)',
                fontWeight: 800,
                letterSpacing: '0.02em',
              }}
            >
              {item.label}
            </Typography>
            <Typography
              sx={{
                color: 'var(--color-text)',
                fontWeight: 900,
                fontSize: '1.15rem',
                mt: 0.25,
                overflowWrap: 'anywhere',
              }}
            >
              {item.value}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
            {item.helper}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

const DetailTile = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
}) => (
  <Box
    sx={{
      p: 1.75,
      borderRadius: '10px',
      border: (theme) =>
        `1px solid ${
          theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(15,23,42,0.08)'
        }`,
      background:
        'linear-gradient(145deg, rgba(0,198,169,0.06), rgba(35,167,213,0.035))',
      minWidth: 0,
    }}
  >
    <Stack direction="row" spacing={1.2} alignItems="flex-start">
      <Box
        sx={{
          mt: 0.25,
          color: 'var(--color-primary)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {icon}
      </Box>
      <Box minWidth={0}>
        <Typography
          variant="caption"
          sx={{ color: 'var(--color-secondary)', fontWeight: 800 }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            color: 'var(--color-text)',
            fontWeight: 800,
            overflowWrap: 'anywhere',
          }}
        >
          {value || '—'}
        </Typography>
      </Box>
    </Stack>
  </Box>
);

const ChecklistRow = ({ item }: { item: ChecklistItem }) => (
  <Box
    sx={{
      display: 'flex',
      gap: 1.2,
      alignItems: 'flex-start',
      p: 1.4,
      borderRadius: '9px',
      backgroundColor: item.passed
        ? 'rgba(16,185,129,0.075)'
        : 'rgba(245,158,11,0.075)',
      border: item.passed
        ? '1px solid rgba(16,185,129,0.2)'
        : '1px solid rgba(245,158,11,0.22)',
    }}
  >
    <Box
      sx={{
        color: item.passed ? 'success.main' : 'warning.main',
        display: 'grid',
        placeItems: 'center',
        mt: 0.2,
      }}
    >
      {item.passed ? <MdCheckCircle size={20} /> : <MdWarning size={20} />}
    </Box>
    <Box minWidth={0}>
      <Typography sx={{ color: 'var(--color-text)', fontWeight: 800 }}>
        {item.label}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
        {item.helper}
      </Typography>
    </Box>
  </Box>
);

const LoadingState = () => {
  const theme = useTheme();

  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        {[0, 1, 2, 3].map((item) => (
          <Card key={item} elevation={0} sx={createPanelSx(theme)}>
            <CardContent sx={{ p: 2.25 }}>
              <Stack spacing={1.5}>
                <Skeleton variant="rounded" width={42} height={42} />
                <Skeleton width="55%" height={18} />
                <Skeleton width="85%" height={28} />
                <Skeleton width="100%" height={18} />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card elevation={0} sx={createPanelSx(theme)}>
        <CardContent>
          <Stack spacing={1.5}>
            <Skeleton width={180} height={28} />
            <Skeleton variant="rounded" height={120} />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

const SnmpOverview = ({ data, isLoading, error }: SnmpOverviewProps) => {
  const theme = useTheme();

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: '10px', fontWeight: 700 }}>
        خطا در دریافت اطلاعات SNMP: {error.message}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info" sx={{ borderRadius: '10px', fontWeight: 700 }}>
        اطلاعاتی برای نمایش وجود ندارد.
      </Alert>
    );
  }

  const allowedIps = data.allowed_ips?.length ? data.allowed_ips : [];
  const visibleIps = allowedIps.slice(0, 10);
  const hiddenIpCount = Math.max(allowedIps.length - visibleIps.length, 0);
  const openBindAddress = isOpenBindAddress(data.bind_ip);
  const snmpV3 = isSnmpV3(data.version);
  const hasRestrictedAcl = allowedIps.length > 0 && !allowedIps.includes('0.0.0.0/0');
  const hasIdentity = hasValue(data.sys_name) && hasValue(data.contact) && hasValue(data.location);

  const checklist: ChecklistItem[] = [
    {
      id: 'enabled',
      label: 'وضعیت سرویس مشخص است',
      passed: Boolean(data.enabled),
      helper: data.enabled
        ? 'سرویس SNMP فعال است و برای مانیتورینگ قابل استفاده خواهد بود.'
        : 'سرویس غیرفعال است؛ سیستم‌های مانیتورینگ داده‌ای دریافت نمی‌کنند.',
    },
    {
      id: 'bind',
      label: 'Bind IP محدود شده است',
      passed: !openBindAddress && hasValue(data.bind_ip),
      helper: openBindAddress
        ? 'Bind روی همه interfaceها ریسک سطح دسترسی را بالا می‌برد.'
        : 'Bind IP مشخص شده و سطح exposure کنترل‌شده‌تر است.',
    },
    {
      id: 'acl',
      label: 'Access Control تعریف شده است',
      passed: hasRestrictedAcl,
      helper: hasRestrictedAcl
        ? 'لیست IPهای مجاز محدود شده و برای محیط سازمانی مناسب‌تر است.'
        : 'برای SNMP بهتر است فقط subnet یا IP مانیتورینگ مجاز باشد.',
    },
    {
      id: 'version',
      label: 'نسخه امن‌تر SNMP',
      passed: snmpV3,
      helper: snmpV3
        ? 'SNMPv3 برای محیط enterprise مناسب‌تر است.'
        : 'در صورت امکان SNMPv3 را جایگزین community-based access کنید.',
    },
    {
      id: 'identity',
      label: 'هویت و مالک سرویس کامل است',
      passed: hasIdentity,
      helper: hasIdentity
        ? 'System name، location و contact برای NOC/Monitoring کامل هستند.'
        : 'برای troubleshooting سازمانی بهتر است contact، location و system name کامل باشند.',
    },
  ];

  const passedChecklistCount = checklist.filter((item) => item.passed).length;
  const readinessPercent = Math.round((passedChecklistCount / checklist.length) * 100);

  const metrics: MetricCardItem[] = [
    {
      id: 'status',
      label: 'Service Status',
      value: data.enabled ? 'فعال' : 'غیرفعال',
      helper: data.enabled
        ? 'SNMP agent آماده پاسخ‌گویی به سیستم مانیتورینگ است.'
        : 'برای دریافت metricها باید سرویس فعال شود.',
      icon: data.enabled ? <MdCheckCircle size={24} /> : <MdOutlineError size={24} />,
      tone: data.enabled ? 'success' : 'error',
    },
    {
      id: 'version',
      label: 'Protocol',
      value: data.version || '—',
      helper: snmpV3
        ? 'نسخه انتخاب‌شده برای محیط‌های حساس مناسب‌تر است.'
        : 'SNMP v1/v2c ساده‌تر است اما امنیت کمتری دارد.',
      icon: <MdSecurity size={24} />,
      tone: snmpV3 ? 'success' : 'warning',
    },
    {
      id: 'port',
      label: 'Port / Bind',
      value: `${data.port || '—'} / ${data.bind_ip || '—'}`,
      helper: openBindAddress
        ? 'سرویس روی همه interfaceها گوش می‌دهد.'
        : 'Bind address محدودتر و قابل کنترل‌تر است.',
      icon: <MdSettingsEthernet size={24} />,
      tone: openBindAddress ? 'warning' : 'success',
    },
    {
      id: 'acl',
      label: 'Allowed Sources',
      value: allowedIps.length || '—',
      helper: allowedIps.length
        ? 'تعداد sourceهای مجاز برای query گرفتن از SNMP.'
        : 'هیچ منبع مجازی برای دسترسی مشخص نشده است.',
      icon: <MdShield size={24} />,
      tone: hasRestrictedAcl ? 'success' : 'warning',
    },
  ];

  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        {metrics.map((item) => (
          <MetricCard key={item.id} item={item} />
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.25fr) minmax(320px, 0.75fr)' },
          gap: 2,
          alignItems: 'stretch',
        }}
      >
        <Card elevation={0} sx={createPanelSx(theme)}>
          <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
            <Stack spacing={2.25}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: 'var(--color-primary)', fontWeight: 900 }}
                  >
                    نمای عملیاتی SNMP
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.4 }}>
                    وضعیت identity، endpoint و سیاست دسترسی سرویس
                  </Typography>
                </Box>

                <Chip
                  label={`${readinessPercent}% آمادگی`}
                  sx={{
                    fontWeight: 900,
                    color: readinessPercent >= 80 ? 'success.main' : 'warning.main',
                    backgroundColor:
                      readinessPercent >= 80
                        ? 'rgba(16,185,129,0.1)'
                        : 'rgba(245,158,11,0.1)',
                    border: readinessPercent >= 80
                      ? '1px solid rgba(16,185,129,0.25)'
                      : '1px solid rgba(245,158,11,0.25)',
                  }}
                />
              </Stack>

              <Box>
                <LinearProgress
                  variant="determinate"
                  value={readinessPercent}
                  sx={{
                    height: 8,
                    borderRadius: 999,
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(15,23,42,0.08)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 999,
                      background:
                        readinessPercent >= 80
                          ? 'linear-gradient(90deg, #10b981, var(--color-primary))'
                          : 'linear-gradient(90deg, #f59e0b, var(--color-primary-light))',
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                  gap: 1.5,
                }}
              >
                <DetailTile
                  label="System Name"
                  value={data.sys_name || '—'}
                  icon={<MdDns size={20} />}
                />
                <DetailTile
                  label="Community"
                  value={maskCommunity(data.community)}
                  icon={<MdAdminPanelSettings size={20} />}
                />
                <DetailTile
                  label="Contact"
                  value={data.contact || '—'}
                  icon={<MdSecurity size={20} />}
                />
                <DetailTile
                  label="Location"
                  value={data.location || '—'}
                  icon={<MdLocationOn size={20} />}
                />
              </Box>

              <Divider />

              <Stack spacing={1.25}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <MdLan color="var(--color-primary)" size={22} />
                  <Typography sx={{ color: 'var(--color-text)', fontWeight: 900 }}>
                    منابع مجاز برای Query
                  </Typography>
                  <Chip
                    label={allowedIps.length}
                    size="small"
                    sx={{
                      height: 22,
                      fontWeight: 900,
                      color: 'var(--color-primary)',
                      border: '1px solid rgba(0,198,169,0.3)',
                      backgroundColor: 'rgba(0,198,169,0.08)',
                    }}
                  />
                </Stack>

                {visibleIps.length > 0 ? (
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {visibleIps.map((ip) => (
                      <Chip
                        key={ip}
                        label={ip}
                        variant="outlined"
                        sx={{
                          borderRadius: '999px',
                          fontWeight: 800,
                          color: 'var(--color-text)',
                          borderColor: openBindAddress
                            ? 'rgba(245,158,11,0.45)'
                            : 'rgba(0,198,169,0.32)',
                          backgroundColor: openBindAddress
                            ? 'rgba(245,158,11,0.08)'
                            : 'rgba(0,198,169,0.06)',
                        }}
                      />
                    ))}

                    {hiddenIpCount > 0 ? (
                      <Chip
                        label={`+${hiddenIpCount} مورد دیگر`}
                        sx={{
                          fontWeight: 900,
                          color: 'var(--color-primary)',
                          backgroundColor: 'rgba(0,198,169,0.1)',
                        }}
                      />
                    ) : null}
                  </Stack>
                ) : (
                  <Alert severity="warning" sx={{ borderRadius: '9px' }}>
                    هیچ IP مجازی تعریف نشده است. برای محیط enterprise بهتر است فقط سرورهای مانیتورینگ مجاز باشند.
                  </Alert>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card elevation={0} sx={createPanelSx(theme)}>
          <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ color: 'var(--color-primary)', fontWeight: 900 }}
                >
                  Enterprise Readiness
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.4 }}>
                  چک‌لیست سریع برای امن‌تر و عملیاتی‌تر کردن SNMP
                </Typography>
              </Box>

              <Stack spacing={1.15}>
                {checklist.map((item) => (
                  <ChecklistRow key={item.id} item={item} />
                ))}
              </Stack>

              {readinessPercent < 80 ? (
                <Alert severity="warning" sx={{ borderRadius: '9px' }}>
                  پیشنهاد: برای محیط سازمانی، SNMPv3، محدودسازی ACL و تکمیل contact/location را در اولویت بگذار.
                </Alert>
              ) : (
                <Alert severity="success" sx={{ borderRadius: '9px' }}>
                  تنظیمات فعلی برای مانیتورینگ سازمانی وضعیت مناسبی دارد.
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
};

export default SnmpOverview;