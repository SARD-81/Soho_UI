import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNetwork } from '../hooks/useNetwork';
import '../index.css';

type ResponsiveChartContainerProps = {
  height: number;
  children: (width: number) => ReactNode;
};

const ResponsiveChartContainer = ({
  height,
  children,
}: ResponsiveChartContainerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const updateWidth = () => {
      setWidth(element.getBoundingClientRect().width);
    };

    if (typeof ResizeObserver === 'undefined') {
      updateWidth();
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setWidth(entry.contentRect.width);
      }
    });

    observer.observe(element);
    updateWidth();

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        minHeight: height,
      }}
    >
      {width > 0 && children(width)}
    </Box>
  );
};

type History = Record<
  string,
  Array<{ time: number; upload: number; download: number }>
>;

const MAX_HISTORY_MS = 90 * 1000; // 1 minute 30 seconds

const Network = () => {
  const { data, isLoading, error } = useNetwork();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const chartSize = isSmallScreen ? 150 : 260;

  const [history, setHistory] = useState<History>({});
  const startTimeRef = useRef<number>(Date.now());

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

  if (error) return <Typography>Error: {error.message}</Typography>;

  const interfaces = data?.interfaces ?? {};
  const names = Object.keys(interfaces);

  const extractInterfaceAddresses = (
    networkInterface: (typeof interfaces)[string] | undefined
  ) => {
    if (!networkInterface?.addresses) {
      return [] as string[];
    }

    const rawAddresses = Array.isArray(networkInterface.addresses)
      ? networkInterface.addresses
      : typeof networkInterface.addresses === 'object'
        ? Object.values(networkInterface.addresses)
        : [];

    const collected = rawAddresses
      .map((entry) => {
        if (!entry) {
          return null;
        }
        if (typeof entry === 'string') {
          const trimmed = entry.trim();
          return trimmed.length > 0 ? trimmed : null;
        }
        if (typeof entry === 'object' && 'address' in entry) {
          const possible = (entry as { address?: unknown }).address;
          if (typeof possible === 'string') {
            const trimmed = possible.trim();
            if (trimmed.length > 0) {
              return trimmed;
            }
          }
        }
        if (typeof entry === 'object') {
          const nestedValue = Object.values(entry).find(
            (value) => typeof value === 'string' && value.trim().length > 0
          );
          if (typeof nestedValue === 'string') {
            return nestedValue.trim();
          }
        }
        return null;
      })
      .filter((value): value is string => Boolean(value));

    const unique = Array.from(new Set(collected));
    unique.sort((a, b) => {
      const aIsIPv4 = a.includes('.') && !a.includes(':');
      const bIsIPv4 = b.includes('.') && !b.includes(':');
      if (aIsIPv4 === bIsIPv4) {
        return a.localeCompare(b, 'fa');
      }
      return aIsIPv4 ? -1 : 1;
    });

    return unique;
  };

  const resolveInterfaceLabel = (interfaceName: string) => {
    const addressList = extractInterfaceAddresses(interfaces[interfaceName]);
    if (addressList.length === 0) {
      return interfaceName;
    }
    return `${interfaceName} (${addressList.join('، ')})`;
  };

  const tooltipSx = {
    direction: 'rtl',
    '& .MuiChartsTooltip-table': {
      direction: 'rtl',
      color: 'var(--color-text)',
    },
    '& .MuiChartsTooltip-label': {
      color: 'var(--color-text)',
      fontFamily: 'var(--font-vazir)',
    },
    '& .MuiChartsTooltip-value': {
      color: 'var(--color-text)',
      fontFamily: 'var(--font-vazir)',
    },
    '& .MuiChartsTooltip-cell': {
      color: 'var(--color-text)',
      fontFamily: 'var(--font-vazir)',
    },
  } as const;

  const cardBorderColor =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(0, 0, 0, 0.08)';

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: 'var(--color-card-bg)',
        borderRadius: 3,
        mb: 3,
        color: 'var(--color-bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 3,
        border: `1px solid ${cardBorderColor}`,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.18)',
        width: '100%',
        height: '100%',
      }}
    >
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
          📉
        </Box>
        نمودار های شبکه
      </Typography>
      {names.length === 0 ? (
        <ResponsiveChartContainer height={chartSize}>
          {(width) => (
            <LineChart
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
                noDataOverlay: { message: 'No network data' },
                tooltip: { sx: tooltipSx },
              }}
            />
          )}
        </ResponsiveChartContainer>
      ) : (
        names.map((name) => {
          const interfaceInfo = interfaces[name];
          const unit = interfaceInfo?.bandwidth.unit ?? '';
          const displayName = resolveInterfaceLabel(name);
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
                borderRadius: '10px',
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
                  <LineChart
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
                      },
                    ]}
                    series={[
                      {
                        dataKey: 'download',
                        label: `دانلود (${unit})`,
                        color: '#00bcd4',
                        valueFormatter: (value) => `${value} ${unit}`,
                        showMark: false,
                      },
                      {
                        dataKey: 'upload',
                        label: `آپلود (${unit})`,
                        color: '#ff4d94',
                        valueFormatter: (value) => `${value} ${unit}`,
                        showMark: false,
                      },
                    ]}
                    margin={{ left: 40, right: 24, top: 20, bottom: 20 }}
                    slotProps={{
                      legend: {
                        sx: {
                          color: 'var(--color-text)',
                          fontFamily: 'var(--font-vazir)',
                        },
                        position: { vertical: 'top', horizontal: 'center' },
                      },
                      noDataOverlay: { message: 'No network data' },
                      tooltip: { sx: tooltipSx },
                    }}
                  />
                )}
              </ResponsiveChartContainer>
            </Box>
          );
        })
      )}
    </Box>
  );
};

export default Network;
