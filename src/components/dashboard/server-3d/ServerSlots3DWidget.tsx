import {
  Alert,
  Box,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { MdDns, MdStorage } from 'react-icons/md';
import { createCardSx } from '../../cardStyles';
import { usePoolDeviceSlots } from '../../../hooks/usePoolDeviceSlots';
import { useZpool } from '../../../hooks/useZpool';
import DiskSlotDetailsPanel from './DiskSlotDetailsPanel';
import ServerChassisScene from './ServerChassisScene';
import type { ServerSceneColors } from './ServerBay';
import {
  DEFAULT_SERVER_SLOT_COUNT,
  buildServerSlots,
  sortServerSlots,
} from './serverSlotModel';

const ServerSlots3DWidget = () => {
  const theme = useTheme();
  const cardSx = createCardSx(theme);
  const [selectedSlotNumber, setSelectedSlotNumber] = useState<number | null>(null);

  const {
    data: zpoolData,
    isLoading: isPoolsLoading,
    error: poolsError,
  } = useZpool({
    refetchInterval: 60_000,
  });

  const poolNames = useMemo(
    () =>
      (zpoolData?.pools ?? [])
        .map((pool) => pool.name.trim())
        .filter((poolName) => poolName.length > 0),
    [zpoolData?.pools]
  );

  const {
    data: poolDeviceSlots,
    isLoading: isSlotsLoading,
    isFetching: isSlotsFetching,
  } = usePoolDeviceSlots(poolNames, {
    enabled: poolNames.length > 0,
    refetchInterval: 10_000,
  });

  const serverSlots = useMemo(
    () =>
      sortServerSlots(
        buildServerSlots(poolDeviceSlots?.slotsByPool, DEFAULT_SERVER_SLOT_COUNT)
      ),
    [poolDeviceSlots?.slotsByPool]
  );

  const selectedBay = useMemo(
    () =>
      selectedSlotNumber == null
        ? null
        : serverSlots.find((slot) => slot.slotNumber === selectedSlotNumber) ?? null,
    [selectedSlotNumber, serverSlots]
  );

  const occupiedCount = serverSlots.filter((slot) => slot.isOccupied).length;
  const hasSlotErrors =
    Object.keys(poolDeviceSlots?.errorsByPool ?? {}).length > 0;

  const slotErrorMessages = Object.entries(poolDeviceSlots?.errorsByPool ?? {});

  const colors: ServerSceneColors = useMemo(
    () => ({
      chassis: theme.palette.mode === 'dark' ? '#101318' : '#1b1f26',
      chassisEdge: theme.palette.mode === 'dark' ? '#2c3441' : '#38404d',
      bay: theme.palette.mode === 'dark' ? '#1d2430' : '#151b24',
      bayDark: '#05070b',
      primary: theme.palette.primary.main,
      primaryLight: theme.palette.primary.light,
      selected: theme.palette.primary.main,
      empty: theme.palette.mode === 'dark' ? '#475569' : '#64748b',
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      unknown: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
    }),
    [theme]
  );

  const isInitialLoading =
    isPoolsLoading || (poolNames.length > 0 && isSlotsLoading && !poolDeviceSlots);

  if (isInitialLoading) {
    return (
      <Box sx={{ ...cardSx, width: '100%', minHeight: 520 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Skeleton variant="circular" width={34} height={34} />
          <Skeleton variant="text" width={180} height={28} />
        </Stack>
        <Divider />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' },
            gap: 2,
            minHeight: 380,
          }}
        >
          <Skeleton variant="rounded" height={380} sx={{ borderRadius: '12px' }} />
          <Skeleton variant="rounded" height={380} sx={{ borderRadius: '12px' }} />
        </Box>
      </Box>
    );
  }

  if (poolsError) {
    return (
      <Box sx={{ ...cardSx, width: '100%' }}>
        <Alert severity="error">
          خطا در دریافت اطلاعات فضاهای یکپارچه: {poolsError.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ ...cardSx, width: '100%', minHeight: 520 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        gap={1.5}
      >
        <Stack direction="row" alignItems="center" gap={1.25}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '12px',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--color-primary)',
              backgroundColor: 'rgba(0,198,169,0.1)',
              border: '1px solid rgba(0,198,169,0.25)',
            }}
          >
            <MdDns size={24} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 900, color: 'var(--color-text)' }}>
              نمای سه‌بعدی سرور
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              مدل تعاملی اسلات‌ها و جزئیات دیسک‌ها
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" gap={1} flexWrap="wrap">
          <Chip
            icon={<MdStorage />}
            label={`${occupiedCount} از ${DEFAULT_SERVER_SLOT_COUNT} اسلات فعال`}
            size="small"
            sx={{
              fontWeight: 800,
              color: 'var(--color-text)',
              backgroundColor: 'rgba(0,198,169,0.08)',
              border: '1px solid rgba(0,198,169,0.22)',
            }}
          />
          {isSlotsFetching ? (
            <Chip
              label="در حال بروزرسانی"
              size="small"
              sx={{
                fontWeight: 700,
                color: 'var(--color-secondary)',
                backgroundColor: 'rgba(163,146,75,0.09)',
              }}
            />
          ) : null}
        </Stack>
      </Stack>

      {hasSlotErrors ? (
        <Alert severity="warning" sx={{ borderRadius: '10px' }}>
          {slotErrorMessages.map(([poolName, message]) => (
            <Typography key={poolName} variant="body2">
              {poolName}: {message}
            </Typography>
          ))}
        </Alert>
      ) : null}

      {poolNames.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: '10px' }}>
          هیچ فضای یکپارچه‌ای برای استخراج اطلاعات اسلات‌ها پیدا نشد. مدل سرور به صورت
          خالی نمایش داده می‌شود.
        </Alert>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 380px' },
          gap: 2,
          alignItems: 'stretch',
          minHeight: { xs: 680, lg: 390 },
        }}
      >
        <Box
          sx={{
            minHeight: { xs: 340, md: 390 },
            borderRadius: '14px',
            overflow: 'hidden',
            position: 'relative',
            background:
              theme.palette.mode === 'dark'
                ? 'radial-gradient(circle at 50% 20%, rgba(0,198,169,0.12), rgba(15,23,42,0.06) 42%, rgba(0,0,0,0.04) 100%)'
                : 'radial-gradient(circle at 50% 20%, rgba(0,198,169,0.13), rgba(35,167,213,0.06) 42%, rgba(255,255,255,0.18) 100%)',
            border: (innerTheme) =>
              `1px solid ${
                innerTheme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.07)'
                  : 'rgba(0,0,0,0.07)'
              }`,
          }}
        >
          <ServerChassisScene
            slots={serverSlots}
            selectedSlotNumber={selectedSlotNumber}
            colors={colors}
            onSelectSlot={setSelectedSlotNumber}
          />

          <Box
            sx={{
              position: 'absolute',
              right: 14,
              bottom: 14,
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              pointerEvents: 'none',
            }}
          >
            <Chip
              label="کلیک روی هر اسلات"
              size="small"
              sx={{
                fontFamily: 'var(--font-vazir)',
                fontWeight: 800,
                color: 'var(--color-text)',
                backdropFilter: 'blur(8px)',
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(15,23,42,0.68)'
                    : 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(0,198,169,0.22)',
              }}
            />
          </Box>
        </Box>

        <DiskSlotDetailsPanel selectedBay={selectedBay} />
      </Box>
    </Box>
  );
};

export default ServerSlots3DWidget;