import {
  Alert,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import type React from 'react';
import type { SnmpInfoData } from '../../@types/snmp';

interface SnmpOverviewProps {
  data?: SnmpInfoData;
  isLoading: boolean;
  error: Error | null;
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Stack spacing={0.5} sx={{ minWidth: 0 }}>
    <Typography variant="body2" sx={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
      {label}
    </Typography>
    <Typography
      variant="body1"
      sx={{ color: 'var(--color-text)', fontWeight: 700, wordBreak: 'break-word' }}
    >
      {value ?? '—'}
    </Typography>
  </Stack>
);

const SnmpOverview = ({ data, isLoading, error }: SnmpOverviewProps) => {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 240 }}>
        <CircularProgress color="primary" />
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">خطا در دریافت اطلاعات SNMP: {error.message}</Alert>;
  }

  if (!data) {
    return <Alert severity="info">اطلاعاتی برای نمایش وجود ندارد.</Alert>;
  }

  const allowedIps = data.allowed_ips?.length ? data.allowed_ips : ['—'];

  return (
    <Stack spacing={2}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-card-bg)',
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ color: 'var(--color-primary)', fontWeight: 800 }}>
              وضعیت سرویس
            </Typography>
            <Chip
              label={data.enabled ? 'فعال' : 'غیرفعال'}
              color={data.enabled ? 'success' : 'default'}
              variant={data.enabled ? 'filled' : 'outlined'}
              sx={{ fontWeight: 700 }}
            />
          </Stack>

          <Stack
            spacing={2}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
            }}
          >
            <DetailItem label="جامعه" value={data.community || '—'} />
            <DetailItem label="نسخه" value={data.version || '—'} />
            <DetailItem label="پورت" value={data.port || '—'} />
            <DetailItem label="نام سیستم" value={data.sys_name || '—'} />
            <DetailItem label="آی‌پی بایند" value={data.bind_ip || '—'} />
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="body2" sx={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
              آی‌پی‌های مجاز
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1.2}>
              {allowedIps.map((ip) => (
                <Chip key={ip} label={ip} sx={{ fontWeight: 600 }} />
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-card-bg)',
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ color: 'var(--color-primary)', fontWeight: 800 }}>
            جزئیات تماس و شناسایی
          </Typography>

          <Stack
            spacing={2}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
            }}
          >
            <DetailItem label="تماس" value={data.contact || '—'} />
            <DetailItem label="مکان" value={data.location || '—'} />
            <DetailItem label="نام سیستم" value={data.sys_name || '—'} />
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default SnmpOverview;
