import {
  Box,
  Button,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  MdAccessTime,
  MdDns,
  MdInsights,
  MdOutlineSystemUpdateAlt,
  MdWidgets,
} from 'react-icons/md';
import { useMemo } from 'react';
import { useSystemInfo } from '../hooks/useSystemInfo';
import { createCardSx } from './cardStyles';

const formatText = (value?: string | null) => {
  if (!value) {
    return '—';
  }

  const trimmed = value.toString().trim();
  return trimmed.length > 0 ? trimmed : '—';
};

const SystemInfo = () => {
  const theme = useTheme();
  const cardSx = createCardSx(theme);
  const { data, isLoading, error } = useSystemInfo();

  const uptimeText = useMemo(() => {
    const human = formatText(data?.uptime?.humanReadable);
    const asOf = formatText(data?.uptime?.asOf);

    if (human === '—' && asOf === '—') {
      return '—';
    }

    if (asOf === '—') {
      return human;
    }

    if (human === '—') {
      return asOf;
    }

    return `${human} به‌عنوان ${asOf}`;
  }, [data?.uptime?.asOf, data?.uptime?.humanReadable]);

  if (isLoading) {
    return (
      <Box sx={{ ...cardSx, gap: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={1}>
            <Skeleton variant="text" width={160} height={32} sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width={110} height={20} sx={{ borderRadius: 1 }} />
          </Stack>
          <Skeleton variant="circular" width={40} height={40} />
        </Stack>
        <Box
          sx={{
            width: '100%',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
            bgcolor: alpha(theme.palette.background.default, theme.palette.mode === 'dark' ? 0.3 : 0.6),
            p: 2.5,
          }}
        >
          <Skeleton variant="text" width={120} height={20} sx={{ borderRadius: 1, mb: 2 }} />
          <Stack spacing={2}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Stack
                key={index}
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ width: '100%' }}
              >
                <Skeleton variant="circular" width={32} height={32} />
                <Stack flex={1} spacing={0.5}>
                  <Skeleton variant="text" width="50%" height={18} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="text" width="70%" height={20} sx={{ borderRadius: 1 }} />
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Skeleton variant="rounded" height={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={cardSx}>
        <Typography variant="body2" color="error">
          خطا در دریافت اطلاعات سیستم: {error.message}
        </Typography>
      </Box>
    );
  }

  const infoItems = [
    {
      key: 'platform',
      label: 'پلتفرم',
      value: formatText(data?.platform),
      icon: <MdWidgets size={20} />,
    },
    {
      key: 'version',
      label: 'نسخه',
      value: formatText(data?.version),
      icon: <MdInsights size={20} />,
    },
    {
      key: 'hostname',
      label: 'نام میزبان',
      value: formatText(data?.hostname),
      icon: <MdDns size={20} />,
    },
    {
      key: 'uptime',
      label: 'زمان کارکرد',
      value: uptimeText,
      icon: <MdAccessTime size={20} />,
    },
  ];

  const updatesAvailable = data?.updates?.available ?? false;
  const updatesMessage = formatText(data?.updates?.message);

  return (
    <Box sx={{ ...cardSx, gap: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack spacing={0.5}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {formatText(data?.productName)}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {formatText(data?.productLine)}
          </Typography>
        </Stack>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '16%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.main,
          }}
        >
          <MdOutlineSystemUpdateAlt size={26} />
        </Box>
      </Stack>

      <Box
        sx={{
          width: '100%',
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
          bgcolor: alpha(
            theme.palette.mode === 'dark'
              ? theme.palette.background.paper
              : theme.palette.background.default,
            theme.palette.mode === 'dark' ? 0.45 : 0.7
          ),
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          نمای کلی سیستم
        </Typography>
        <Stack spacing={2}>
          {infoItems.map((item) => (
            <Stack
              key={item.key}
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{
                px: 1,
                py: 1,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.palette.primary.main,
                }}
              >
                {item.icon}
              </Box>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.value}
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Box>

      {updatesAvailable ? (
        <Button
          variant="contained"
          color="info"
          startIcon={<MdOutlineSystemUpdateAlt size={20} />}
          sx={{ alignSelf: 'flex-start' }}
        >
          {updatesMessage === '—' ? 'به‌روزرسانی در دسترس است' : updatesMessage}
        </Button>
      ) : (
        <Typography variant="caption" color="text.secondary">
          سیستم به‌روز است
        </Typography>
      )}
    </Box>
  );
};

export default SystemInfo;