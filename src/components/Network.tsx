import {
  Box,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaNetworkWired } from 'react-icons/fa6';
import type { History, HistoryPoint } from '../@types/network';
import { formatBytes } from '../utils/formatters';
import { useNetwork } from '../hooks/useNetwork';
import { extractIPv4Info, formatInterfaceSpeed } from '../utils/networkDetails';
import DashboardWidgetHeader from './dashboard/DashboardWidgetHeader';
import { createCardSx } from './cardStyles.ts';
import AppLineChart from './charts/AppLineChart';
import ResponsiveChartContainer from './charts/ResponsiveChartContainer';

const MAX_HISTORY_MS = 90 * 1000;

const formatTimeTo24Hour = (date: Date): string =>
  date.toLocaleTimeString('en-GB', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

const getChartRange = (history: HistoryPoint[], startTime: number) => {
  const now = Date.now();
  const elapsed = now - startTime;
  const min = elapsed < MAX_HISTORY_MS ? startTime : now - MAX_HISTORY_MS;

  return { min, max: min + MAX_HISTORY_MS };
};

const Network = () => {
  const { data, isLoading, error } = useNetwork();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const chartSize = isSmallScreen ? 180 : 260;
  const cardSx = createCardSx(theme);
  const [history, setHistory] = useState<History>({});
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!data?.interfaces) {
      return;
    }

    setHistory((previousHistory) => {
      const now = Date.now();
      const nextHistory: History = { ...previousHistory };

      Object.entries(data.interfaces).forEach(
        ([name, { bandwidth, currentSpeed }]) => {
          const points = nextHistory[name]
            ? nextHistory[name].filter(
                (point) => now - point.time <= MAX_HISTORY_MS
              )
            : [];

          points.push({
            time: now,
            upload: bandwidth.upload,
            download: bandwidth.download,
            currentUploadSpeed: currentSpeed.upload,
            currentDownloadSpeed: currentSpeed.download,
          });

          nextHistory[name] = points;
        }
      );

      return nextHistory;
    });
  }, [data]);

  const speedFormatter = useMemo(
    () => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }),
    []
  );

  const metaInfoBorderColor =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(0, 0, 0, 0.12)';

  const metaInfoBackground =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.04)'
      : 'rgba(0, 0, 0, 0.03)';

  if (isLoading && !data) {
    return (
      <Box sx={cardSx}>
        <Skeleton variant="text" width="45%" height={28} />
        <Skeleton variant="rounded" height={chartSize} />
        <Skeleton variant="rounded" height={chartSize} />
      </Box>
    );
  }

  if (error && !data) {
    return (
      <Box sx={cardSx}>
        <Typography variant="body2" sx={{ color: 'var(--color-error)' }}>
          خطا در دریافت داده‌های شبکه: {error.message}
        </Typography>
      </Box>
    );
  }

  const interfaces = data?.interfaces ?? {};
  const names = Object.keys(interfaces);

  return (
    <Box sx={cardSx}>
      <DashboardWidgetHeader
        icon={<FaNetworkWired size={20} />}
        title="شبکه"
        subtitle="ترافیک و سرعت لحظه‌ای رابط‌های شبکه"
      />

      {names.length === 0 ? (
        <ResponsiveChartContainer height={chartSize}>
          {(width) => (
            <AppLineChart
              width={width}
              height={chartSize}
              dataset={[]}
              loading={isLoading}
              skipAnimation
              xAxis={[{ dataKey: 'time', scaleType: 'time' }]}
              series={[
                {
                  dataKey: 'download',
                  label: 'دانلود',
                  color: '#00bcd4',
                  showMark: false,
                },
                {
                  dataKey: 'upload',
                  label: 'آپلود',
                  color: '#ff4d94',
                  showMark: false,
                },
              ]}
              slotProps={{
                noDataOverlay: { message: 'اطلاعات شبکه در دسترس نیست' },
              }}
            />
          )}
        </ResponsiveChartContainer>
      ) : (
        names.map((name) => {
          const interfaceInfo = interfaces[name];
          const ipv4Details = extractIPv4Info(interfaceInfo);
          const speedText = formatInterfaceSpeed(
            interfaceInfo?.status,
            speedFormatter
          );
          const interfaceHistory = history[name] ?? [];
          const { min, max } = getChartRange(
            interfaceHistory,
            startTimeRef.current
          );
          const maxTrafficValue = interfaceHistory.reduce(
            (maximum, point) =>
              Math.max(maximum, point.download, point.upload),
            0
          );
          const maxCurrentSpeedValue = interfaceHistory.reduce(
            (maximum, point) =>
              Math.max(
                maximum,
                point.currentDownloadSpeed,
                point.currentUploadSpeed
              ),
            0
          );

          return (
            <Box
              key={name}
              sx={{
                p: 2,
                bgcolor: 'var(--color-card-bg)',
                mb: 2,
                borderRadius: '8px',
                border: '1px solid color-mix(in srgb, var(--color-primary) 55%, transparent)',
                width: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 1.5, color: 'var(--color-primary)', fontWeight: 800 }}
              >
                {name}
              </Typography>

              <Typography
                variant="subtitle2"
                sx={{ mb: 0.5, color: 'var(--color-text)', fontWeight: 700 }}
              >
                ترافیک شبکه
              </Typography>
              <ResponsiveChartContainer height={chartSize}>
                {(width) => (
                  <AppLineChart
                    width={width}
                    height={chartSize}
                    dataset={interfaceHistory}
                    skipAnimation
                    loading={isLoading}
                    xAxis={[
                      {
                        dataKey: 'time',
                        valueFormatter: (value) =>
                          formatTimeTo24Hour(new Date(value)),
                        scaleType: 'time',
                        min,
                        max,
                      },
                    ]}
                    yAxis={[
                      {
                        label: 'حجم',
                        max: maxTrafficValue || 15,
                        position: 'left',
                        tickSize: 56,
                        width: 156,
                        tickLabelStyle: {
                          fill: 'var(--color-text)',
                          direction: 'ltr',
                        },
                        valueFormatter: (value: number | null | undefined) =>
                          formatBytes(value),
                      },
                    ]}
                    series={[
                      {
                        dataKey: 'download',
                        label: 'دانلود',
                        color: '#00bcd4',
                        valueFormatter: (value: number | null | undefined) =>
                          formatBytes(value),
                        showMark: false,
                      },
                      {
                        dataKey: 'upload',
                        label: 'آپلود',
                        color: '#ff4d94',
                        valueFormatter: (value: number | null | undefined) =>
                          formatBytes(value),
                        showMark: false,
                      },
                    ]}
                    margin={{ left: 40, right: 24, top: 20, bottom: 20 }}
                    slotProps={{
                      noDataOverlay: { message: 'اطلاعات ترافیک در دسترس نیست' },
                    }}
                  />
                )}
              </ResponsiveChartContainer>

              <Typography
                variant="subtitle2"
                sx={{ mt: 2.5, mb: 0.5, color: 'var(--color-text)', fontWeight: 700 }}
              >
                سرعت لحظه‌ای آپلود و دانلود
              </Typography>
              <ResponsiveChartContainer height={chartSize}>
                {(width) => (
                  <AppLineChart
                    width={width}
                    height={chartSize}
                    dataset={interfaceHistory}
                    skipAnimation
                    loading={isLoading}
                    xAxis={[
                      {
                        dataKey: 'time',
                        valueFormatter: (value) =>
                          formatTimeTo24Hour(new Date(value)),
                        scaleType: 'time',
                        min,
                        max,
                      },
                    ]}
                    yAxis={[
                      {
                        label: 'سرعت',
                        max: maxCurrentSpeedValue || 15,
                        position: 'left',
                        tickSize: 56,
                        width: 156,
                        tickLabelStyle: {
                          fill: 'var(--color-text)',
                          direction: 'ltr',
                        },
                        valueFormatter: (value: number | null | undefined) =>
                          `${formatBytes(value)}/s`,
                      },
                    ]}
                    series={[
                      {
                        dataKey: 'currentDownloadSpeed',
                        label: 'سرعت دانلود',
                        color: '#00bcd4',
                        valueFormatter: (value: number | null | undefined) =>
                          `${formatBytes(value)}/s`,
                        showMark: false,
                      },
                      {
                        dataKey: 'currentUploadSpeed',
                        label: 'سرعت آپلود',
                        color: '#ff4d94',
                        valueFormatter: (value: number | null | undefined) =>
                          `${formatBytes(value)}/s`,
                        showMark: false,
                      },
                    ]}
                    margin={{ left: 40, right: 24, top: 20, bottom: 20 }}
                    slotProps={{
                      noDataOverlay: {
                        message: 'اطلاعات سرعت لحظه‌ای در دسترس نیست',
                      },
                    }}
                  />
                )}
              </ResponsiveChartContainer>

              <Box
                sx={{
                  mt: 2,
                  width: '100%',
                  bgcolor: metaInfoBackground,
                  borderRadius: '5px',
                  px: 2,
                  py: 1.5,
                  border: `1px dashed ${metaInfoBorderColor}`,
                  display: 'flex',
                  alignItems: 'flex-end',
                  flexDirection: 'column',
                  gap: 0.75,
                }}
              >
                {ipv4Details.length > 0 ? (
                  ipv4Details.map((entry, index) => (
                    <Box
                      key={`${entry.address ?? `ipv4-${index}`}-${index}`}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.85,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {ipv4Details.length > 1
                          ? `IPv4 ${index + 1}: ${entry.address}`
                          : `IPv4: ${entry.address}`}
                      </Typography>
                      {entry.netmask ? (
                        <Typography
                          variant="body2"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          Netmask: {entry.netmask}
                        </Typography>
                      ) : null}
                    </Box>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    آدرس IPv4 در دسترس نیست.
                  </Typography>
                )}
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  link speed: {speedText}
                </Typography>
              </Box>
            </Box>
          );
        })
      )}
    </Box>
  );
};

export default Network;
