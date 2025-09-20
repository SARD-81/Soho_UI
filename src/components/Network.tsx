import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  useNetwork,
  type InterfaceAddress,
  type NetworkInterface,
} from '../hooks/useNetwork';
import '../index.css';
import type {
  History,
  IPv4Info,
  ResponsiveChartContainerProps,
} from '../@types/components/network';
import { MAX_HISTORY_MS } from '../constants/components/network';
import { createCardSx } from './cardStyles';

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


const trimIfStringHasValue = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toCleanString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return trimIfStringHasValue(value);
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return null;
};

const flattenAddressEntries = (value: unknown): InterfaceAddress[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenAddressEntries(entry));
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;

    if ('address' in record || 'netmask' in record || 'family' in record) {
      const candidate = record as InterfaceAddress;

      return [
        {
          ...candidate,
          address: toCleanString(candidate.address),
          netmask: toCleanString(candidate.netmask),
          family: toCleanString(candidate.family),
        },
      ];
    }

    return Object.values(record).flatMap((entry) =>
      flattenAddressEntries(entry)
    );
  }

  if (typeof value === 'string') {
    const trimmed = trimIfStringHasValue(value);
    return trimmed ? [{ address: trimmed }] : [];
  }

  return [];
};

const extractIPv4Info = (
  networkInterface: NetworkInterface | undefined
): IPv4Info[] => {
  if (!networkInterface) {
    return [];
  }

  const flattened = flattenAddressEntries(networkInterface.addresses);

  const ipv4Entries = flattened
    .map((entry) => {
      const address = toCleanString(entry.address);
      const family = toCleanString(entry.family)?.toLowerCase() ?? '';

      if (!address) {
        return null;
      }

      const isIPv4ByAddress = address.includes('.') && !address.includes(':');
      const isIPv4ByFamily =
        family === 'ipv4' ||
        family === 'inet' ||
        family.includes('af_inet') ||
        (family.includes('inet') && !family.includes('6'));

      if (!isIPv4ByAddress && !isIPv4ByFamily) {
        return null;
      }

      if (!isIPv4ByAddress) {
        return null;
      }

      const netmask = toCleanString(entry.netmask);

      return {
        address,
        netmask: netmask ?? null,
      };
    })
    .filter((value): value is IPv4Info => Boolean(value));

  return ipv4Entries.reduce<IPv4Info[]>((acc, current) => {
    const existingIndex = acc.findIndex(
      (item) => item.address === current.address
    );

    if (existingIndex === -1) {
      acc.push(current);
    } else if (!acc[existingIndex].netmask && current.netmask) {
      acc[existingIndex] = { ...acc[existingIndex], netmask: current.netmask };
    }

    return acc;
  }, []);
};

const formatInterfaceSpeed = (
  status: NetworkInterface['status'] | undefined,
  formatter: Intl.NumberFormat
) => {
  const rawSpeed = status?.speed;
  const numericSpeed = Number(rawSpeed);

  if (!Number.isFinite(numericSpeed) || numericSpeed <= 0) {
    return 'نامشخص';
  }

  return `${formatter.format(numericSpeed)} Mbps`;
};

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

  const speedFormatter = useMemo(
    () => new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }),
    []
  );

  if (error) return <Typography>Error: {error.message}</Typography>;

  const interfaces = data?.interfaces ?? {};
  const names = Object.keys(interfaces);

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

  const metaInfoBorderColor =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(0, 0, 0, 0.12)';

  const metaInfoBackground =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.04)'
      : 'rgba(0, 0, 0, 0.03)';

  const cardSx = {
    ...createCardSx(theme),
    alignItems: 'stretch',
  } as const;

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
                        position: 'left',
                        tickSize: 18, // ⬅ increase gap between numbers and the y-axis line
                        width: 56, // ⬅ reserve room so labels don’t get clipped
                        tickLabelStyle: { fill: 'var(--color-text)' },
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
              <Box
                sx={{
                  mt: 2,
                  width: '100%',
                  bgcolor: metaInfoBackground,
                  borderRadius: 2,
                  px: 2,
                  py: 1.5,
                  border: `1px dashed ${metaInfoBorderColor}`,
                  display: 'flex',
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
                    const netmaskSuffix = entry.netmask
                      ? ` نت‌ماسک: ${entry.netmask}`
                      : '';

                    return (
                      <>
                        <Typography
                          key={`${entry.address}-${index}`}
                          variant="body2"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {`${labelPrefix}${entry.address}`}
                        </Typography>
                        <Typography
                          key={`${entry.address}-${index}`}
                          variant="body2"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {`${netmaskSuffix}`}
                        </Typography>
                      </>
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
                  سرعت لینک: {speedText}
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
