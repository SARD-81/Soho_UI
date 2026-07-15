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
import { useSystemPowerActions } from '../../../contexts/SystemPowerActionsContext';
import { usePoolDeviceSlots } from '../../../hooks/usePoolDeviceSlots';
import { useZpool } from '../../../hooks/useZpool';
import { createCardSx } from '../../cardStyles';
import DashboardWidgetHeader from '../DashboardWidgetHeader';
import DiskSlotDetailsPanel from './DiskSlotDetailsPanel';
import type { ServerSceneColors } from './ServerBay';
import ServerChassisScene from './ServerChassisScene';
import {
  buildServerSlots,
  resolveServerSlotCount,
  sortServerSlots,
} from './serverSlotModel';

const ServerSlots3DWidget = () => {
  const theme = useTheme();
  const cardSx = createCardSx(theme);
  const [selectedSlotNumber, setSelectedSlotNumber] = useState<number | null>(
    null
  );
  const { requestPowerAction, isPowerActionDisabled } = useSystemPowerActions();

  const {
    data: zpoolData,
    isLoading: isPoolsLoading,
    error: poolsError,
  } = useZpool({
    refetchInterval: 30_000,
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
    enabled: true,
    refetchInterval: 10_000,
  });

  const slotCount = useMemo(
    () =>
      resolveServerSlotCount(
        poolDeviceSlots?.slotsByPool,
        poolDeviceSlots?.inventory
      ),
    [poolDeviceSlots?.inventory, poolDeviceSlots?.slotsByPool]
  );

  const serverSlots = useMemo(
    () =>
      sortServerSlots(
        buildServerSlots(
          poolDeviceSlots?.slotsByPool,
          poolDeviceSlots?.inventory,
          slotCount
        )
      ),
    [poolDeviceSlots?.inventory, poolDeviceSlots?.slotsByPool, slotCount]
  );

  const selectedBay = useMemo(
    () =>
      selectedSlotNumber == null
        ? null
        : (serverSlots.find((slot) => slot.slotNumber === selectedSlotNumber) ??
          null),
    [selectedSlotNumber, serverSlots]
  );

  const discoveredDiskCount = serverSlots.filter((slot) => slot.disk).length;
  const freeDiskCount = serverSlots.filter(
    (slot) => slot.health === 'free'
  ).length;
  const inactiveDiskCount = serverSlots.filter(
    (slot) => slot.health === 'inactive'
  ).length;
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
      free: theme.palette.mode === 'dark' ? '#334155' : '#94a3b8',
      inactive: theme.palette.warning.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      unknown: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
    }),
    [theme]
  );

  const isInitialLoading =
    isPoolsLoading || (isSlotsLoading && !poolDeviceSlots);

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
          <Skeleton
            variant="rounded"
            height={380}
            sx={{ borderRadius: '12px' }}
          />
          <Skeleton
            variant="rounded"
            height={380}
            sx={{ borderRadius: '12px' }}
          />
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
      {/* Header power buttons are intentionally hidden; the 3D panel controls are the single interaction point. */}
      <DashboardWidgetHeader
        icon={<MdDns size={20} />}
        title="نمای سه‌بعدی سرور"
        subtitle="مدل تعاملی اسلات‌ها و جزئیات تمام دیسک‌های سامانه"
        status={
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Chip
              icon={<MdStorage />}
              label={`${discoveredDiskCount} از ${slotCount} اسلات دارای دیسک`}
              size="small"
              sx={{
                fontWeight: 800,
                color: 'var(--color-text)',
                backgroundColor: 'rgba(0,198,169,0.08)',
                border: '1px solid rgba(0,198,169,0.22)',
              }}
            />
            {freeDiskCount > 0 ? (
              <Chip
                label={`${freeDiskCount} دیسک آزاد`}
                size="small"
                sx={{
                  fontWeight: 700,
                  color: 'var(--color-secondary)',
                  backgroundColor: 'rgba(148,163,184,0.1)',
                }}
              />
            ) : null}
            {inactiveDiskCount > 0 ? (
              <Chip
                label={`${inactiveDiskCount} دیسک غیرفعال`}
                size="small"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.warning.main,
                  backgroundColor: 'rgba(245,158,11,0.1)',
                }}
              />
            ) : null}
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
        }
      />

      {hasSlotErrors ? (
        <Alert severity="warning" sx={{ borderRadius: '10px' }}>
          {slotErrorMessages.map(([poolName, message]) => (
            <Typography key={poolName} variant="body2">
              {poolName}: {message}
            </Typography>
          ))}
        </Alert>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 380px' },
          gap: 2,
          alignItems: { xs: 'stretch', lg: 'start' },
        }}
      >
        <Box
          sx={{
            height: { xs: 340, md: 390 },
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
            onRequestReboot={() => requestPowerAction('reboot')}
            onRequestPoweroff={() => requestPowerAction('poweroff')}
            powerActionsDisabled={isPowerActionDisabled}
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

        <Box
          sx={{
            height: { xs: 'auto', lg: 390 },
            minHeight: { xs: 280, lg: 390 },
            minWidth: 0,
          }}
        >
          <DiskSlotDetailsPanel selectedBay={selectedBay} />
        </Box>
      </Box>
    </Box>
  );
};

export default ServerSlots3DWidget;
