import {
  Box,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useMemo } from 'react';
import type { DiskDevice, DiskUsage } from '../@types/disk';
import { createCardSx } from '../components/cardStyles';
import AppPieChart from '../components/charts/AppPieChart';
import {
  clampPercent,
  diskPercentFormatter,
  safeNumber,
  tooltipMultilineSx,
} from '../constants/disk';
import { useDisk } from '../hooks/useDisk';
import { formatBytes } from '../utils/formatters';

type NormalizedUsage = {
  total: number;
  used: number;
  free: number;
  percent: number;
  hasData: boolean;
};

const normalizeUsage = (usage?: Partial<DiskUsage> | null): NormalizedUsage => {
  const totalRaw = safeNumber(usage?.total);
  const usedRaw = safeNumber(usage?.used);
  const freeRaw = safeNumber(usage?.free);

  const nonNegativeUsed = Math.max(usedRaw, 0);
  const nonNegativeFree = Math.max(freeRaw, 0);

  const derivedTotal =
    totalRaw > 0 ? totalRaw : nonNegativeUsed + nonNegativeFree;

  const safeTotal =
    derivedTotal > 0 ? derivedTotal : nonNegativeUsed + nonNegativeFree;

  const boundedUsed =
    safeTotal > 0 ? Math.min(nonNegativeUsed, safeTotal) : nonNegativeUsed;

  const fallbackFree = safeTotal > boundedUsed ? safeTotal - boundedUsed : 0;

  const boundedFree =
    nonNegativeFree > 0
      ? Math.min(
          nonNegativeFree,
          fallbackFree > 0 ? fallbackFree : nonNegativeFree
        )
      : fallbackFree;

  const percentValue =
    usage?.percent != null ? Number(usage.percent) : Number.NaN;

  const percent = Number.isFinite(percentValue)
    ? clampPercent(percentValue)
    : safeTotal > 0
      ? clampPercent((boundedUsed / safeTotal) * 100)
      : 0;

  const hasData = safeTotal > 0 || boundedUsed > 0 || boundedFree > 0;

  return {
    total: safeTotal,
    used: boundedUsed,
    free: boundedFree,
    percent,
    hasData,
  };
};

type DeviceUsageEntry = {
  device: DiskDevice;
  usage: NormalizedUsage;
};

const Storage = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { data, isLoading, error } = useDisk();

  const cardSx = createCardSx(theme);

  const isDarkMode = theme.palette.mode === 'dark';
  const cardBorderColor = isDarkMode
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)';
  const statsDividerColor = isDarkMode
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)';
  const statsBackground = isDarkMode
    ? 'rgba(255, 255, 255, 0.04)'
    : 'rgba(0, 0, 0, 0.03)';
  const remainingColor = isDarkMode
    ? 'rgba(255, 255, 255, 0.28)'
    : 'rgba(0, 0, 0, 0.16)';

  const normalizedDevices = useMemo<DeviceUsageEntry[]>(
    () =>
      (data?.disks ?? []).map((device) => ({
        device,
        usage: normalizeUsage(device.usage),
      })),
    [data?.disks]
  );

  const aggregatedUsage = useMemo<NormalizedUsage>(() => {
    const totals = normalizedDevices.reduce(
      (acc, { usage }) => {
        if (!usage.hasData) {
          return acc;
        }

        acc.total += usage.total;
        acc.used += usage.used;
        acc.free += usage.free;
        acc.hasData = true;

        return acc;
      },
      { total: 0, used: 0, free: 0, hasData: false }
    );

    if (!totals.hasData) {
      return { total: 0, used: 0, free: 0, percent: 0, hasData: false };
    }

    const normalized = normalizeUsage({
      total: totals.total,
      used: totals.used,
      free: totals.free,
      percent:
        totals.total > 0 ? (totals.used / totals.total) * 100 : undefined,
    });

    return { ...normalized, hasData: normalized.hasData };
  }, [normalizedDevices]);

  const summaryChartSize = isMediumScreen ? 220 : 260;
  const deviceChartSize = isSmallScreen ? 180 : 210;

  const showSummarySkeleton = isLoading && !aggregatedUsage.hasData;
  const showDevicesSkeleton = isLoading && normalizedDevices.length === 0;

  const usedColor = theme.palette.primary.main;

  if (error) {
    return (
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          fontFamily: 'var(--font-vazir)',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Typography variant="h5" sx={{ color: 'var(--color-primary)' }}>
          ذخیره سازی
        </Typography>
        <Box sx={cardSx}>
          <Typography
            variant="body2"
            sx={{ color: 'var(--color-error)', fontWeight: 500 }}
          >
            خطا در دریافت داده‌های ذخیره‌سازی: {error.message}
          </Typography>
        </Box>
      </Box>
    );
  }

  const summaryPercentText = `${diskPercentFormatter.format(
    aggregatedUsage.percent
  )}٪`;
  const summaryFree = Math.max(
    aggregatedUsage.total - aggregatedUsage.used,
    aggregatedUsage.free,
    0
  );

  const summaryStats = [
    {
      key: 'total',
      label: 'کل',
      value: formatBytes(aggregatedUsage.total),
    },
    {
      key: 'used',
      label: 'استفاده‌شده',
      value: formatBytes(aggregatedUsage.used),
    },
    {
      key: 'free',
      label: 'فضای آزاد',
      value: formatBytes(summaryFree),
    },
    {
      key: 'percent',
      label: 'درصد استفاده',
      value: summaryPercentText,
    },
  ];

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        fontFamily: 'var(--font-vazir)',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Typography variant="h5" sx={{ color: 'var(--color-primary)' }}>
        ذخیره سازی
      </Typography>

      <Box sx={cardSx}>
        <Typography
          variant="subtitle2"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 600,
          }}
        >
          <Box component="span" sx={{ fontSize: 20 }}>
            💾
          </Box>
          مخزن ذخیره‌سازی یکپارچه
        </Typography>

        {showSummarySkeleton ? (
          <Stack spacing={3} sx={{ width: '100%' }}>
            <Skeleton
              variant="rounded"
              height={summaryChartSize}
              sx={{ borderRadius: 3 }}
            />
            <Skeleton variant="rounded" height={112} sx={{ borderRadius: 2 }} />
          </Stack>
        ) : aggregatedUsage.hasData ? (
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 3, md: 4 }}
            alignItems="center"
          >
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                maxWidth: summaryChartSize + 24,
              }}
            >
              <AppPieChart
                series={[
                  {
                    id: 'storage-summary',
                    data: [
                      {
                        id: 'used',
                        value: aggregatedUsage.used,
                        label: 'استفاده‌شده',
                        color: usedColor,
                      },
                      {
                        id: 'free',
                        value: summaryFree,
                        label: 'فضای آزاد',
                        color: remainingColor,
                      },
                    ],
                    innerRadius: 60,
                    outerRadius: Math.min(summaryChartSize / 2, 120),
                    paddingAngle: 1.2,
                    cornerRadius: 5,
                    startAngle: 0,
                    endAngle: 360,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    valueFormatter: (item) => {
                      if (item.id === 'used') {
                        return [
                          `${formatBytes(aggregatedUsage.used)} : استفاده‌شده`,
                          `${formatBytes(aggregatedUsage.total)} : کل`,
                          `${formatBytes(summaryFree)} : فضای آزاد`,
                          `${summaryPercentText} : درصد استفاده`,
                        ].join('\n');
                      }
                      return `${formatBytes(summaryFree)} : فضای آزاد`;
                    },
                  },
                ]}
                width={summaryChartSize}
                height={summaryChartSize}
                margin={{ top: 12, bottom: 12, left: 12, right: 12 }}
                hideLegend
                slotProps={{ tooltip: { sx: tooltipMultilineSx } }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  gap: 0.5,
                }}
              >
                <Typography
                  variant={isSmallScreen ? 'h5' : 'h4'}
                  sx={{
                    fontFamily: 'var(--font-didot)',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                  }}
                >
                  {summaryPercentText}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  درصد استفاده
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                width: '100%',
                bgcolor: statsBackground,
                borderRadius: 2,
                px: 2.5,
                py: 2,
                border: `1px solid ${statsDividerColor}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {summaryStats.map((stat, index) => (
                <Box
                  key={stat.key}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    py: 0.75,
                    borderBottom:
                      index === summaryStats.length - 1
                        ? 'none'
                        : `1px dashed ${statsDividerColor}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: 'var(--color-primary)' }}
                  >
                    {stat.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            داده‌ای برای مخزن ذخیره‌سازی در دسترس نیست.
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          جزئیات دستگاه‌ها
        </Typography>

        {showDevicesSkeleton ? (
          <Box
            sx={{
              display: 'grid',
              gap: 2.5,
              gridTemplateColumns: {
                xs: 'repeat(1, minmax(0, 1fr))',
                md: 'repeat(2, minmax(0, 1fr))',
                xl: 'repeat(3, minmax(0, 1fr))',
              },
            }}
          >
            {Array.from({ length: isSmallScreen ? 2 : 3 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: 'var(--color-card-bg)',
                  border: `1px solid ${cardBorderColor}`,
                  boxShadow: '0 16px 32px rgba(0, 0, 0, 0.18)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Skeleton
                  variant="text"
                  width="60%"
                  height={20}
                  sx={{ borderRadius: 1 }}
                />
                <Skeleton
                  variant="text"
                  width="45%"
                  height={16}
                  sx={{ borderRadius: 1 }}
                />
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Skeleton
                    variant="circular"
                    width={deviceChartSize}
                    height={deviceChartSize}
                    sx={{ bgcolor: 'action.hover' }}
                  />
                </Box>
                <Skeleton
                  variant="rounded"
                  height={96}
                  sx={{ borderRadius: 2 }}
                />
              </Box>
            ))}
          </Box>
        ) : normalizedDevices.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gap: 2.5,
              gridTemplateColumns: {
                xs: 'repeat(1, minmax(0, 1fr))',
                md: 'repeat(2, minmax(0, 1fr))',
                xl: 'repeat(3, minmax(0, 1fr))',
              },
            }}
          >
            {normalizedDevices.map(({ device, usage }) => {
              const percentText = `${diskPercentFormatter.format(
                usage.percent
              )}٪`;
              const deviceFree = Math.max(
                usage.total - usage.used,
                usage.free,
                0
              );
              const deviceStats = [
                {
                  key: 'total',
                  label: 'کل',
                  value: formatBytes(usage.total),
                },
                {
                  key: 'used',
                  label: 'استفاده‌شده',
                  value: formatBytes(usage.used),
                },
                {
                  key: 'free',
                  label: 'فضای آزاد',
                  value: formatBytes(deviceFree),
                },
                {
                  key: 'percent',
                  label: 'درصد استفاده',
                  value: percentText,
                },
              ];

              const cardKey = `${device.device}-${device.mountpoint || 'na'}`;

              return (
                <Box
                  key={cardKey}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: 'var(--color-card-bg)',
                    border: `1px solid ${cardBorderColor}`,
                    boxShadow: '0 16px 32px rgba(0, 0, 0, 0.18)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    minHeight: '100%',
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {device.device}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      محل سوار شدن: {device.mountpoint || 'نامشخص'}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      سیستم فایل: {(device.fstype || '-').toUpperCase()}
                    </Typography>
                  </Stack>

                  {usage.hasData ? (
                    <>
                      <Box
                        sx={{
                          position: 'relative',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                          maxWidth: deviceChartSize + 24,
                          alignSelf: 'center',
                        }}
                      >
                        <AppPieChart
                          series={[
                            {
                              id: `${cardKey}-usage`,
                              data: [
                                {
                                  id: 'used',
                                  value: usage.used,
                                  label: 'استفاده‌شده',
                                  color: usedColor,
                                },
                                {
                                  id: 'free',
                                  value: deviceFree,
                                  label: 'فضای آزاد',
                                  color: remainingColor,
                                },
                              ],
                              innerRadius: 52,
                              outerRadius: Math.min(deviceChartSize / 2, 110),
                              paddingAngle: 1.2,
                              cornerRadius: 5,
                              startAngle: 0,
                              endAngle: 360,
                              highlightScope: {
                                fade: 'global',
                                highlight: 'item',
                              },
                              valueFormatter: (item) => {
                                if (item.id === 'used') {
                                  return [
                                    `${formatBytes(usage.used)} : استفاده‌شده`,
                                    `${formatBytes(usage.total)} : کل`,
                                    `${formatBytes(deviceFree)} : فضای آزاد`,
                                    `${percentText} : درصد استفاده`,
                                  ].join('\n');
                                }
                                return `${formatBytes(deviceFree)} : فضای آزاد`;
                              },
                            },
                          ]}
                          width={deviceChartSize}
                          height={deviceChartSize}
                          margin={{ top: 12, bottom: 12, left: 12, right: 12 }}
                          hideLegend
                          slotProps={{ tooltip: { sx: tooltipMultilineSx } }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                            gap: 0.5,
                          }}
                        >
                          <Typography
                            variant="h5"
                            sx={{
                              fontFamily: 'var(--font-didot)',
                              fontWeight: 700,
                              color: 'var(--color-primary)',
                            }}
                          >
                            {percentText}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            درصد استفاده
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          width: '100%',
                          bgcolor: statsBackground,
                          borderRadius: 2,
                          px: 2,
                          py: 1.5,
                          border: `1px solid ${statsDividerColor}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        {deviceStats.map((stat, index) => (
                          <Box
                            key={stat.key}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 2,
                              py: 0.75,
                              borderBottom:
                                index === deviceStats.length - 1
                                  ? 'none'
                                  : `1px dashed ${statsDividerColor}`,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                color: theme.palette.text.secondary,
                              }}
                            >
                              {stat.label}
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                color: 'var(--color-primary)',
                              }}
                            >
                              {stat.value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', mt: 1 }}
                    >
                      داده‌ای برای این دستگاه در دسترس نیست.
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            دستگاهی برای نمایش وجود ندارد.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Storage;
