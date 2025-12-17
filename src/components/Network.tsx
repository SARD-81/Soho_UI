import {
  Box,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { History } from '../@types/network';
import { useNetwork } from '../hooks/useNetwork';
import { extractIPv4Info, formatInterfaceSpeed } from '../utils/networkDetails';
import { formatBytes } from '../utils/formatters';
import { createCardSx } from './cardStyles.ts';
import AppLineChart from './charts/AppLineChart';
import ResponsiveChartContainer from './charts/ResponsiveChartContainer';
import { FaNetworkWired } from "react-icons/fa6";

const MAX_HISTORY_MS = 90 * 1000; // 1 minute 30 seconds

const Network = () => {
  const { data, isLoading, error } = useNetwork();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const chartSize = isSmallScreen ? 150 : 260;
  const cardSx = createCardSx(theme);

  const [history, setHistory] = useState<History>({});
  const startTimeRef = useRef<number>(Date.now());
  const formatBandwidthValue = (value: number | null | undefined) =>
    formatBytes(Math.max(value ?? 0, 0), { maximumFractionDigits: 1 });

  useEffect(() => {
    if (!data?.interfaces) return;
    setHistory((prev) => {
      const now = Date.now();
      const next: History = { ...prev };
      Object.entries(data.interfaces).forEach(([name, { bandwidth }]) => {
        const points = next[name]
          ? next[name].filter((p) => now - p.time <= MAX_HISTORY_MS)
          : [];
        points.push({
          time: now,
          upload: bandwidth.upload,
          download: bandwidth.download,
        });
        next[name] = points;
      });
      return next;
    });
  }, [data]);

  const speedFormatter = useMemo(
    () => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }),
    []
  );

  if (isLoading && !data) {
    return (
      <Box sx={cardSx}>
        <Skeleton
          variant="text"
          width="45%"
          height={28}
          sx={{ borderRadius: 1 }}
        />
        <Skeleton
          variant="rectangular"
          height={chartSize}
          sx={{ borderRadius: 2, bgcolor: 'action.hover' }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Array.from({ length: 2 }).map((_, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                bgcolor: 'var(--color-card-bg)',
                borderRadius: '10px',
                border: '2px solid var(--color-primary)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Skeleton
                variant="text"
                width="35%"
                height={22}
                sx={{ borderRadius: 1 }}
              />
              <Skeleton
                variant="rectangular"
                height={chartSize}
                sx={{ borderRadius: 2, bgcolor: 'action.hover' }}
              />
              <Skeleton
                variant="text"
                width="55%"
                height={18}
                sx={{ borderRadius: 1 }}
              />
              <Skeleton
                variant="text"
                width="40%"
                height={18}
                sx={{ borderRadius: 1 }}
              />
            </Box>
          ))}
        </Box>
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

  const metaInfoBorderColor =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(0, 0, 0, 0.12)';

  const metaInfoBackground =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.04)'
      : 'rgba(0, 0, 0, 0.03)';

  return (
    <Box sx={cardSx}>
      <Typography
        variant="subtitle2"
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontWeight: 600,
          color: 'var(--color-bg-primary)',
        }}
      >
        <Box component="span" sx={{ fontSize: 20 }}>
          <FaNetworkWired size={30} />
        </Box>
        وضعیت شبکه
      </Typography>
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
          const unit = interfaceInfo?.bandwidth.unit ?? '';
          const ipv4Details = extractIPv4Info(interfaceInfo);
          const displayName = `${name}`;
          const speedText = formatInterfaceSpeed(
            interfaceInfo?.status,
            speedFormatter
          );

          const now = Date.now();
          const elapsed = now - startTimeRef.current;
          const min =
            elapsed < MAX_HISTORY_MS
              ? startTimeRef.current
              : now - MAX_HISTORY_MS;
          const max = min + MAX_HISTORY_MS;
          const interfaceHistory = history[name] ?? [];
          const maxCombinedValue = interfaceHistory.reduce((acc, point) => {
            const total = point.download + point.upload;
            return total > acc ? total : acc;
          }, 0);

          return (
            <Box
              key={name}
              sx={{
                p: 2,
                bgcolor: 'var(--color-card-bg)',
                mb: 2,
                borderRadius: '5px',
                border: '2px solid var(--color-primary)',
                width: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 1, color: 'var(--color-primary)' }}
              >
                {displayName}
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
                          new Date(value).toLocaleTimeString(),
                        scaleType: 'time',
                        min,
                        max,
                      },
                    ]}
                    yAxis={[
                      {
                        label: unit,
                        max: maxCombinedValue || 15,
                        position: 'left',
                        tickSize: 76, // ⬅ increase gap between numbers and the y-axis line
                        width: 156, // ⬅ reserve room so labels don’t get clipped
                        tickLabelStyle: { fill: 'var(--color-text)' },
                        valueFormatter: (value: number | null | undefined) =>
                          formatBandwidthValue(value),
                      },
                    ]}
                    series={[
                      {
                        dataKey: 'download',
                        label: `دانلود `,
                        color: '#00bcd4',
                        valueFormatter: (value: number | null | undefined) =>
                          formatBandwidthValue(value),
                        showMark: false,
                      },
                      {
                        dataKey: 'upload',
                        label: `آپلود `,
                        color: '#ff4d94',
                        valueFormatter: (value: number | null | undefined) =>
                          formatBandwidthValue(value),
                        showMark: false,
                      },
                    ]}
                    margin={{ left: 40, right: 24, top: 20, bottom: 20 }}
                    slotProps={{
                      noDataOverlay: { message: 'No network data' },
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
                  ipv4Details.map((entry, index) => {
                    const labelPrefix =
                      ipv4Details.length > 1
                        ? ` IPv4 ${index + 1}: `
                        : ' IPv4: ';
                    const netmaskText = entry.netmask
                      ? `${entry.netmask} : Netmask`
                      : null;
                    const baseKey = entry.address ?? `ipv4-${index}`;

                    return (
                      <Box
                        key={`${baseKey}-${index}`}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.85,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            marginLeft: 2,
                            alignSelf: 'self-end',
                          }}
                        >
                          {`${labelPrefix}${entry.address}`}
                        </Typography>
                        {netmaskText && (
                          <Typography
                            variant="body2"
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            {netmaskText}
                          </Typography>
                        )}
                      </Box>
                    );
                  })
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
                  link-speed: {speedText}
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
