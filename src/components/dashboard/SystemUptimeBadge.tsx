import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { MdAccessTime } from 'react-icons/md';
import { useSystemUptime } from '../../hooks/useSystemUptime';

const toPersianDigits = (value: string | number) =>
  String(value).replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]);

const pad = (value: number) => String(value).padStart(2, '0');

const splitUptime = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(safeSeconds / 86_400);
  const hours = Math.floor((safeSeconds % 86_400) / 3_600);
  const minutes = Math.floor((safeSeconds % 3_600) / 60);
  const seconds = safeSeconds % 60;

  return {
    days,
    clock: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
  };
};

const SystemUptimeBadge = () => {
  const { uptimeSeconds, isMock } = useSystemUptime();
  const { days, clock } = splitUptime(uptimeSeconds);

  return (
    <Tooltip
      arrow
      title={
        isMock
          ? 'این مقدار فعلاً نمونه است و بعداً مستقیماً به API آپ‌تایم متصل می‌شود.'
          : 'مدت زمان فعال بودن سامانه از آخرین راه‌اندازی'
      }
    >
      <Stack
        direction="row"
        alignItems="center"
        gap={1.25}
        sx={{
          alignSelf: { xs: 'flex-start', md: 'center' },
          minWidth: { xs: 0, sm: 250 },
          px: 1.5,
          py: 0.9,
          borderRadius: '12px',
          color: 'var(--color-text)',
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 11%, var(--color-card-bg)) 0%, color-mix(in srgb, var(--color-card-bg) 96%, transparent) 100%)',
          border:
            '1px solid color-mix(in srgb, var(--color-primary) 26%, transparent)',
          boxShadow:
            '0 14px 34px -26px color-mix(in srgb, var(--color-primary) 70%, transparent)',
          backdropFilter: 'blur(8px)',
          transition:
            'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            borderColor:
              'color-mix(in srgb, var(--color-primary) 48%, transparent)',
            boxShadow:
              '0 18px 38px -24px color-mix(in srgb, var(--color-primary) 78%, transparent)',
          },
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '10px',
            color: 'var(--color-primary)',
            backgroundColor:
              'color-mix(in srgb, var(--color-primary) 12%, transparent)',
            border:
              '1px solid color-mix(in srgb, var(--color-primary) 28%, transparent)',
          }}
        >
          <MdAccessTime size={21} />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" gap={0.75} mb={0.2}>
            <Typography
              variant="caption"
              sx={{
                color: 'var(--color-secondary)',
                fontWeight: 700,
                lineHeight: 1.4,
              }}
            >
              آپ‌تایم سامانه
            </Typography>

            {isMock ? (
              <Typography
                component="span"
                sx={{
                  px: 0.7,
                  py: 0.1,
                  borderRadius: '999px',
                  fontSize: '0.62rem',
                  lineHeight: 1.6,
                  fontWeight: 800,
                  color: 'var(--color-secondary)',
                  backgroundColor:
                    'color-mix(in srgb, var(--color-secondary) 9%, transparent)',
                  border:
                    '1px solid color-mix(in srgb, var(--color-secondary) 18%, transparent)',
                }}
              >
                نمونه
              </Typography>
            ) : null}
          </Stack>

          <Stack direction="row" alignItems="baseline" gap={0.8}>
            <Stack direction="row" alignItems="center" gap={0.55}>
              <Box
                aria-hidden
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-success)',
                  boxShadow:
                    '0 0 0 4px color-mix(in srgb, var(--color-success) 12%, transparent)',
                  animation: 'soho-uptime-pulse 1.8s ease-in-out infinite',
                  '@keyframes soho-uptime-pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.38 },
                  },
                }}
              />
              <Typography
                component="span"
                sx={{
                  color: 'var(--color-text)',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {toPersianDigits(days)} روز
              </Typography>
            </Stack>

            <Typography
              component="span"
              style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
              sx={{
                color: 'var(--color-primary)',
                fontWeight: 900,
                fontSize: '0.98rem',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}
            >
              {toPersianDigits(clock)}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Tooltip>
  );
};

export default SystemUptimeBadge;
