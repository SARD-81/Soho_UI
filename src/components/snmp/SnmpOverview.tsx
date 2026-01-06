import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Skeleton,
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
    <Typography
      variant="body2"
      sx={{ color: 'var(--color-secondary)', fontWeight: 600, fontSize: '0.9rem' }}
    >
      {label}
    </Typography>
    <Typography
      variant="body1"
      sx={{
        color: 'var(--color-text)',
        fontWeight: 800,
        overflowWrap: 'anywhere',
      }}
    >
      {value ?? '—'}
    </Typography>
  </Stack>
);

const SnmpOverview = ({ data, isLoading, error }: SnmpOverviewProps) => {
  if (isLoading) {
    if (!Skeleton) {
      return (
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 240 }}>
          <CircularProgress color="primary" />
        </Stack>
      );
    }

    return (
      <Stack spacing={2}>
        {[0, 1].map((card) => (
          <Card
            key={card}
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 2,
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-card-bg)',
            }}
          >
            <CardHeader
              title={<Skeleton width={160} height={28} />}
              action={<Skeleton variant="rectangular" width={92} height={28} sx={{ borderRadius: 1 }} />}
              sx={{ p: 0, mb: 2 }}
            />
            <CardContent sx={{ p: 0 }}>
              <Stack spacing={2}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                }}
              >
                {[0, 1, 2].map((item) => (
                  <Stack key={item} spacing={1}>
                    <Skeleton width={96} height={18} />
                    <Skeleton width="100%" height={20} />
                  </Stack>
                ))}
              </Stack>
              {card === 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={1}>
                    <Skeleton width={110} height={18} />
                    <Stack direction="row" flexWrap="wrap" gap={1.2}>
                      {[0, 1, 2].map((chip) => (
                        <Skeleton
                          key={chip}
                          variant="rounded"
                          width={82}
                          height={28}
                          sx={{ borderRadius: 3 }}
                        />
                      ))}
                    </Stack>
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        ))}
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
  const visibleIps = allowedIps.slice(0, 6);
  const hiddenCount = allowedIps.length > 6 ? allowedIps.length - 6 : 0;

  return (
    <Stack spacing={2}>
      <Card
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 2,
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-card-bg)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            borderColor: 'var(--color-primary)',
            transform: 'translateY(-1px)',
          },
        }}
      >
        <CardHeader
          title={
            <Typography variant="h6" sx={{ color: 'var(--color-primary)', fontWeight: 800 }}>
              وضعیت سرویس
            </Typography>
          }
          action={
            <Chip
              label={data.enabled ? 'فعال' : 'غیرفعال'}
              color={data.enabled ? 'success' : 'default'}
              variant={data.enabled ? 'filled' : 'outlined'}
              size="small"
              sx={{ fontWeight: 700 }}
            />
          }
          sx={{ p: 0, mb: 2 }}
        />
        <CardContent sx={{ p: 0 }}>
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

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1}>
            <Typography
              variant="body2"
              sx={{ color: 'var(--color-secondary)', fontWeight: 600, fontSize: '0.9rem' }}
            >
              آی‌پی‌های مجاز
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ rowGap: 1, columnGap: 1 }}>
              {visibleIps.map((ip) => (
                <Chip
                  key={ip}
                  label={ip}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              ))}
              {hiddenCount > 0 && (
                <Chip
                  label={`+${hiddenCount} بیشتر`}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 2,
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-card-bg)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            borderColor: 'var(--color-primary)',
            transform: 'translateY(-1px)',
          },
        }}
      >
        <CardHeader
          title={
            <Typography variant="h6" sx={{ color: 'var(--color-primary)', fontWeight: 800 }}>
              جزئیات تماس و شناسایی
            </Typography>
          }
          sx={{ p: 0, mb: 2 }}
        />
        <CardContent sx={{ p: 0 }}>
          <Stack
            spacing={2}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
            }}
          >
            <DetailItem label="تماس" value={data.contact || '—'} />
            <DetailItem label="مکان" value={data.location || '—'} />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default SnmpOverview;
