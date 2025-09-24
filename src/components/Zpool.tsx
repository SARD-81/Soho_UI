import {
  Alert,
  Box,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useMemo } from 'react';
import { diskPercentFormatter, tooltipMultilineSx } from '../constants/disk';
import { useZpool } from '../hooks/useZpool';
import { createCardSx } from './cardStyles';
import AppPieChart from './charts/AppPieChart';
import { formatBytes } from '../utils/formatters';

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const Zpool = () => {
  const { data, isLoading, error } = useZpool({ refetchInterval: 15000 });
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const chartSize = isSmallScreen ? 180 : 230;

  const cardSx = createCardSx(theme);

  const pools = useMemo(() => data?.pools ?? [], [data?.pools]);
  const failedPools = useMemo(() => data?.failedPools ?? [], [data?.failedPools]);

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

  if (isLoading) {
    return (
      <Box sx={cardSx}>
        <Skeleton
          variant="text"
          width="40%"
          height={28}
          sx={{ borderRadius: 1 }}
        />
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {Array.from({ length: 2 }).map((_, index) => (
            <Box
              key={index}
              sx={{
                flex: '1 1 240px',
                minWidth: 220,
                p: 2.5,
                borderRadius: 3,
                bgcolor: 'var(--color-card-bg)',
                border: `1px solid ${cardBorderColor}`,
                boxShadow: '0 16px 32px rgba(0, 0, 0, 0.18)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Skeleton
                variant="text"
                width="70%"
                height={22}
                sx={{ borderRadius: 1, alignSelf: 'stretch' }}
              />
              <Skeleton
                variant="text"
                width="50%"
                height={18}
                sx={{ borderRadius: 1, alignSelf: 'stretch' }}
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
                  width={chartSize}
                  height={chartSize}
                  sx={{ bgcolor: 'action.hover' }}
                />
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
                {Array.from({ length: 4 }).map((_, statIndex) => (
                  <Box
                    key={statIndex}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      borderBottom:
                        statIndex === 3
                          ? 'none'
                          : `1px dashed ${statsDividerColor}`,
                      py: 0.75,
                    }}
                  >
                    <Skeleton
                      variant="text"
                      width="60%"
                      height={16}
                      sx={{ borderRadius: 1 }}
                    />
                    <Skeleton
                      variant="text"
                      width="30%"
                      height={16}
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={cardSx}>
        <Typography variant="body2" sx={{ color: 'var(--color-error)' }}>
          خطا در دریافت اطلاعات استخرها: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
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
          🗃️
        </Box>
        نمای کلی استخرهای ZFS
      </Typography>

      {failedPools.length > 0 && (
        <Alert
          severity="warning"
          variant="outlined"
          sx={{ direction: 'rtl', fontSize: '0.875rem' }}
        >
          بازیابی اطلاعات برای استخرهای زیر با خطا مواجه شد: {failedPools.join('، ')}
        </Alert>
      )}

      {pools.length > 0 ? (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {pools.map((pool) => {
            const totalRaw = pool.totalBytes ?? 0;
            const usedRaw = pool.usedBytes ?? 0;
            const freeRaw = pool.freeBytes ?? 0;

            const nonNegativeUsed = Math.max(usedRaw, 0);
            const nonNegativeFree = Math.max(freeRaw, 0);
            const derivedTotal =
              totalRaw > 0 ? totalRaw : nonNegativeUsed + nonNegativeFree;
            const safeTotal =
              derivedTotal > 0 ? derivedTotal : nonNegativeUsed + nonNegativeFree;
            const boundedUsed =
              safeTotal > 0
                ? Math.min(nonNegativeUsed, safeTotal)
                : nonNegativeUsed;
            const fallbackFree =
              safeTotal > boundedUsed ? safeTotal - boundedUsed : 0;
            const boundedFree =
              nonNegativeFree > 0
                ? Math.min(
                    nonNegativeFree,
                    fallbackFree > 0 ? fallbackFree : nonNegativeFree
                  )
                : fallbackFree;
            const chartRemaining =
              safeTotal > 0
                ? Math.max(safeTotal - boundedUsed, 0)
                : boundedFree;

            const percentValueRaw = pool.capacityPercent;
            const safePercent =
              percentValueRaw != null && Number.isFinite(percentValueRaw)
                ? clampPercent(percentValueRaw)
                : safeTotal > 0
                  ? clampPercent((boundedUsed / safeTotal) * 100)
                  : 0;
            const percentText = `${diskPercentFormatter.format(safePercent)}٪`;

            const chartOuterRadius = Math.min(110, chartSize / 2 - 8);
            const chartInnerRadius = Math.max(
              chartOuterRadius - 24,
              chartOuterRadius * 0.22
            );

            const stats: Array<{ key: string; label: string; value: string }> = [
              {
                key: 'used',
                label: 'استفاده‌شده',
                value: formatBytes(boundedUsed),
              },
              { key: 'free', label: 'خالی', value: formatBytes(boundedFree) },
              { key: 'total', label: 'کل', value: formatBytes(safeTotal) },
              { key: 'percent', label: 'درصد استفاده', value: percentText },
            ];

            if (pool.health) {
              stats.push({ key: 'health', label: 'سلامت', value: pool.health });
            }

            if (pool.fragmentationPercent != null) {
              stats.push({
                key: 'fragmentation',
                label: 'درصد پراکندگی',
                value: `${diskPercentFormatter.format(pool.fragmentationPercent)}٪`,
              });
            }

            if (pool.deduplication || pool.deduplicationRatio != null) {
              const dedupValue = pool.deduplicationRatio;
              const formatted = pool.deduplication
                ? pool.deduplication
                : dedupValue != null && Number.isFinite(dedupValue)
                  ? `${dedupValue.toFixed(2)}x`
                  : '-';
              stats.push({
                key: 'dedup',
                label: 'ضریب Dedup',
                value: formatted,
              });
            }

            const usedColor = theme.palette.primary.main;
            const remainingColor = isDarkMode
              ? 'rgba(255, 255, 255, 0.28)'
              : 'rgba(0, 0, 0, 0.16)';
            const fadedColor = isDarkMode
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.08)';

            return (
              <Box
                key={pool.name}
                sx={{
                  flex: '1 1 260px',
                  minWidth: 240,
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: 'var(--color-card-bg)',
                  border: `1px solid ${cardBorderColor}`,
                  boxShadow: '0 16px 32px rgba(0, 0, 0, 0.18)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Stack spacing={0.5} sx={{ alignSelf: 'stretch' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {pool.name}
                  </Typography>
                  {pool.health && (
                    <Typography
                      variant="caption"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      وضعیت سلامت: {pool.health}
                    </Typography>
                  )}
                </Stack>

                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <AppPieChart
                    series={[
                      {
                        id: `${pool.name}-capacity`,
                        data: [
                          {
                            id: 'used',
                            value: boundedUsed,
                            label: 'استفاده‌شده',
                            color: usedColor,
                          },
                          {
                            id: 'remaining',
                            value: chartRemaining,
                            label: 'باقی‌مانده',
                            color: remainingColor,
                          },
                        ],
                        innerRadius: 50,
                        outerRadius: chartOuterRadius,
                        paddingAngle: 1.2,
                        cornerRadius: 5,
                        startAngle: 0,
                        endAngle: 360,
                        highlightScope: { fade: 'global', highlight: 'item' },
                        faded: {
                          innerRadius: Math.max(
                            chartInnerRadius - 6,
                            chartInnerRadius * 0.9
                          ),
                          additionalRadius: -12,
                          color: fadedColor,
                        },
                        valueFormatter: (item) => {
                          if (item.id === 'used') {
                            return [
                              `${formatBytes(boundedUsed)} : استفاده‌شده`,
                              `${formatBytes(safeTotal)} : کل`,
                              `${formatBytes(boundedFree)} : خالی`,
                              `${percentText} : درصد استفاده`,
                            ].join('\n');
                          }
                          return `${formatBytes(chartRemaining)} : باقی‌مانده`;
                        },
                      },
                    ]}
                    width={chartSize}
                    height={chartSize}
                    margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    hideLegend
                    slotProps={{
                      tooltip: {
                        sx: tooltipMultilineSx,
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
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
                  }}
                >
                  {stats.map((stat, index) => (
                    <Box
                      key={stat.key}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        py: 0.75,
                        borderBottom:
                          index === stats.length - 1
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
              </Box>
            );
          })}
        </Box>
      ) : (
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary }}
        >
          هیچ استخر فعالی یافت نشد.
        </Typography>
      )}
    </Box>
  );
};

export default Zpool;
