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
  Box,
} from '@mui/material';
import type React from 'react';
import type { SnmpInfoData } from '../../@types/snmp';

interface SnmpOverviewProps {
  data?: SnmpInfoData;
  isLoading: boolean;
  error: Error | null;
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Stack spacing={0.5} sx={{ display: 'flex', minWidth: 0, position: 'relative' }}>
    <Typography
      variant="body2"
      sx={{ 
        color: 'var(--color-secondary)', 
        fontWeight: 600, 
        fontSize: '0.85rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      {label}
    </Typography>
    <Box
      sx={{
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: -12,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '4px',
          height: '4px',
          backgroundColor: 'var(--color-primary)',
          borderRadius: '50%',
          opacity: 0.7,
        }
      }}
    >
      <Typography
        variant="body1"
        sx={{
          color: 'var(--color-text)',
          fontWeight: 700,
          overflowWrap: 'anywhere',
          fontSize: '1.05rem',
          lineHeight: 1.4,
        }}
      >
        {value ?? '—'}
      </Typography>
    </Box>
  </Stack>
);

const createCardSx = (accentColor: string) => ({
  p: { xs: 2.5, md: 3 },
  borderRadius: 2.5,
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-card-bg)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '3px',
    background: `linear-gradient(90deg, ${accentColor} 0%, transparent 100%)`,
    opacity: 0.4,
  },
  '&:hover': {
    boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
    borderColor: accentColor,
    transform: 'translateY(-2px)',
    '&::before': {
      opacity: 0.8,
    },
  },
});

const SnmpOverview = ({ data, isLoading, error }: SnmpOverviewProps) => {
  if (isLoading) {
    if (!Skeleton) {
      return (
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 280 }}>
          <CircularProgress color="primary" size={40} />
        </Stack>
      );
    }

    return (
      <Stack spacing={2.5}>
        {[0, 1].map((card) => (
          <Card key={card} elevation={0} sx={createCardSx('var(--color-primary)')}>
            <CardHeader
              title={<Skeleton width={160} height={30} sx={{ borderRadius: 1 }} />}
              action={<Skeleton variant="rectangular" width={92} height={28} sx={{ borderRadius: 1.5 }} />}
              sx={{ p: 0, mb: 2.5 }}
            />
            <CardContent sx={{ p: 0 }}>
              <Stack spacing={2.5}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                }}
              >
                {[0, 1, 2].map((item) => (
                  <Stack key={item} spacing={1.2}>
                    <Skeleton width={96} height={18} sx={{ borderRadius: 1 }} />
                    <Skeleton width="100%" height={22} sx={{ borderRadius: 1 }} />
                  </Stack>
                ))}
              </Stack>
              {card === 0 && (
                <>
                  <Divider sx={{ my: 2.5, borderColor: 'var(--color-border)', opacity: 0.6 }} />
                  <Stack spacing={1.2}>
                    <Skeleton width={110} height={18} sx={{ borderRadius: 1 }} />
                    <Stack direction="row" flexWrap="wrap" gap={1.2}>
                      {[0, 1, 2].map((chip) => (
                        <Skeleton
                          key={chip}
                          variant="rounded"
                          width={82}
                          height={28}
                          sx={{ borderRadius: 16 }}
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
    return (
      <Alert 
        severity="error" 
        sx={{ 
          borderRadius: 2,
          borderLeft: '4px solid #d32f2f',
          fontWeight: 500,
        }}
      >
        خطا در دریافت اطلاعات SNMP: {error.message}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert 
        severity="info" 
        sx={{ 
          borderRadius: 2,
          borderLeft: '4px solid #0288d1',
          fontWeight: 500,
        }}
      >
        اطلاعاتی برای نمایش وجود ندارد.
      </Alert>
    );
  }

  const allowedIps = data.allowed_ips?.length ? data.allowed_ips : ['—'];
  const visibleIps = allowedIps.slice(0, 6);
  const hiddenCount = allowedIps.length > 6 ? allowedIps.length - 6 : 0;

  return (
    <Stack spacing={2.5}>
      <Card
        elevation={0}
        sx={createCardSx(
          data.enabled ? 'var(--color-primary)' : 'rgba(130, 130, 130, 0.8)'
        )}
      >
        <CardHeader
          title={
            <Typography variant="h6" sx={{ 
              color: 'var(--color-primary)', 
              fontWeight: 800,
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}>
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: data.enabled ? 'success.main' : 'grey.500',
                  display: 'inline-block',
                }}
              />
              وضعیت سرویس
            </Typography>
          }
          action={
            <Chip
              label={data.enabled ? 'فعال' : 'غیرفعال'}
              color={data.enabled ? 'success' : 'default'}
              variant={data.enabled ? 'filled' : 'outlined'}
              size="small"
              sx={{ 
                fontWeight: 700,
                fontSize: '0.85rem',
                borderRadius: 1.5,
                color: "var(--color-text)",
                height: 28,
                px: 1,
                boxShadow: data.enabled ? '0 2px 8px rgba(76, 175, 80, 0.2)' : 'none',
              }}
            />
          }
          sx={{ p: 0, mb: 2.5 }}
        />
        <CardContent sx={{ p: 0 }}>
          <Stack
            spacing={2.5}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
            }}
          >
            <DetailItem label="کامیونیتی" value={data.community || '—'} />
            <DetailItem label="نسخه" value={data.version || '—'} />
            <DetailItem label="پورت" value={data.port || '—'} />
            <DetailItem label="نام سیستم" value={data.sys_name || '—'} />
            <DetailItem label="آی‌پی بایند" value={data.bind_ip || '—'} />
          </Stack>
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={createCardSx('#2196f3')}
      >
        <CardHeader
          title={
            <Typography variant="h6" sx={{ 
              color: '#2196f3', 
              fontWeight: 800,
              fontSize: '1.1rem',
            }}>
              کنترل دسترسی
            </Typography>
          }
          sx={{ p: 0, mb: 2.5 }}
        />
        <CardContent sx={{ p: 0 }}>
          <Stack spacing={1.2}>
            <Typography
              variant="body2"
              sx={{ 
                color: 'var(--color-secondary)', 
                fontWeight: 600, 
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              آی‌پی‌های مجاز
              <Chip
                label={allowedIps.length}
                size="small"
                variant="outlined"
                sx={{ 
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  borderRadius: 1,
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-primary)',
                }}
              />
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ rowGap: 1 }}>
              {visibleIps.map((ip) => (
                <Chip
                  key={ip}
                  label={ip}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    borderRadius: "9999px",
                    height: 28,
                    px: 1.5,
                    color: 'var(--color-text)',
                    borderColor: 'var(--color-border)',
                    backgroundColor:
                      ip !== '—' ? 'rgba(var(--color-primary-rgb), 0.05)' : 'transparent',
                    '&:hover': {
                      borderColor: 'var(--color-primary)',
                      backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
                    }
                  }}
                />
              ))}
              {hiddenCount > 0 && (
                <Chip
                  label={`+${hiddenCount} بیشتر`}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    borderRadius: 1.5,
                    height: 28,
                    px: 1.5,
                    borderColor: 'var(--color-primary)',
                    color: 'var(--color-primary)',
                    backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(var(--color-primary-rgb), 0.15)',
                    }
                  }}
                />
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0} sx={createCardSx('#6c5ce7')}>
        <CardHeader
          title={
            <Typography
              variant="h6"
              sx={{ color: '#6c5ce7', fontWeight: 800, fontSize: '1.1rem' }}
            >
              جزئیات تماس و شناسایی
            </Typography>
          }
          sx={{ p: 0, mb: 2.5 }}
        />
        <CardContent sx={{ p: 0 }}>
          <Stack
            spacing={2.5}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
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
