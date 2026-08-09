import { Box, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import { MdAccessTime } from 'react-icons/md';
import { useSystemUptime } from '../../hooks/useSystemUptime';

const SystemUptimeBadge = () => {
  const { data: numeric, isLoading, isFetching, error } = useSystemUptime();

  return (
    <Tooltip
      arrow
      title={
        error
          ? error.message
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
            'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 70%, var(--color-card-bg)) 0%, color-mix(in srgb, var(--color-card-bg) 96%, transparent) 100%)',
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
            color: error ? 'var(--color-error)' : 'var(--color-primary)',
            backgroundColor: error
              ? 'color-mix(in srgb, var(--color-error) 10%, transparent)'
              : 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
            border: error
              ? '1px solid color-mix(in srgb, var(--color-error) 28%, transparent)'
              : '1px solid color-mix(in srgb, var(--color-primary) 28%, transparent)',
          }}
        >
          <MdAccessTime size={21} />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 0.2,
              color: 'var(--color-secondary)',
              fontWeight: 700,
              lineHeight: 1.4,
            }}
          >
            آپ‌تایم سامانه
          </Typography>

          <Stack direction="row" alignItems="center" gap={0.8}>
            <Box
              aria-hidden
              sx={{
                width: 7,
                height: 7,
                flexShrink: 0,
                borderRadius: '50%',
                backgroundColor: error
                  ? 'var(--color-error)'
                  : 'var(--color-success)',
                boxShadow: error
                  ? '0 0 0 4px color-mix(in srgb, var(--color-error) 12%, transparent)'
                  : '0 0 0 4px color-mix(in srgb, var(--color-success) 12%, transparent)',
                animation:
                  !error && (isLoading || isFetching)
                    ? 'soho-uptime-pulse 1.2s ease-in-out infinite'
                    : 'soho-uptime-pulse 1.8s ease-in-out infinite',
                '@keyframes soho-uptime-pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.38 },
                },
              }}
            />

            {isLoading && !numeric ? (
              <Skeleton variant="text" width={150} height={28} />
            ) : error && !numeric ? (
              <Typography
                component="span"
                sx={{
                  color: 'var(--color-error)',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  whiteSpace: 'nowrap',
                }}
              >
                در دسترس نیست
              </Typography>
            ) : (
              <Typography
                component="span"
                dir="ltr"
                sx={{
                  color: 'var(--color-primary)',
                  fontWeight: 900,
                  fontSize: '1rem',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '0.045em',
                  whiteSpace: 'nowrap',
                  unicodeBidi: 'isolate',
                }}
              >
                {numeric}
              </Typography>
            )}
          </Stack>
        </Box>
      </Stack>
    </Tooltip>
  );
};

export default SystemUptimeBadge;
