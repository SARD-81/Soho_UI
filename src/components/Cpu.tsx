import {
  Box,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { gaugeClasses } from '@mui/x-charts/Gauge';
import { useMemo } from 'react';
import type { RgbColor } from '../@types/cpu.ts';
import { useCpu } from '../hooks/useCpu';
import { createCardSx } from './cardStyles.ts';
import AppGauge from './charts/AppGauge';

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const formatRgb = ({ r, g, b }: RgbColor) => `rgb(${r}, ${g}, ${b})`;

const interpolateColor = (start: RgbColor, end: RgbColor, ratio: number) => ({
  r: Math.round(start.r + (end.r - start.r) * ratio),
  g: Math.round(start.g + (end.g - start.g) * ratio),
  b: Math.round(start.b + (end.b - start.b) * ratio),
});

const START_COLOR: RgbColor = { r: 0, g: 255, b: 0 };
const ALERT_COLOR: RgbColor = { r: 255, g: 0, b: 0 };

const getGaugeColor = (value: number) => {
  const ratio = clampPercent(value) / 100;
  return formatRgb(interpolateColor(START_COLOR, ALERT_COLOR, ratio));
};

const Cpu = () => {
  const { data, isLoading, error } = useCpu();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const chartSize = isSmallScreen ? 150 : 260;
  const cardSx = createCardSx(theme);

  const percentFormatter = useMemo(
    () => new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }),
    []
  );
  const frequencyFormatter = useMemo(
    () => new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 }),
    []
  );
  const integerFormatter = useMemo(
    () => new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }),
    []
  );

  const rawPercent = Number(data?.cpu_percent ?? 0);
  const safePercent = Number.isFinite(rawPercent) ? rawPercent : 0;
  const cpuPercent = clampPercent(safePercent);
  const gaugeColor = useMemo(() => getGaugeColor(cpuPercent), [cpuPercent]);

  const frequencyCurrent =
    data?.cpu_frequency?.current != null
      ? Number(data.cpu_frequency.current)
      : null;
  const frequencyMin =
    data?.cpu_frequency?.min != null ? Number(data.cpu_frequency.min) : null;
  const frequencyMax =
    data?.cpu_frequency?.max != null ? Number(data.cpu_frequency.max) : null;

  const hasPhysical = data?.cpu_cores?.physical != null;
  const hasLogical = data?.cpu_cores?.logical != null;
  const totalCores =
    hasPhysical || hasLogical
      ? Number(data?.cpu_cores?.physical ?? 0) +
        Number(data?.cpu_cores?.logical ?? 0)
      : null;

  const formatFrequency = (value: number | null) =>
    value != null && Number.isFinite(value)
      ? `${frequencyFormatter.format(value)} MHz`
      : '—';

  const frequencyText = formatFrequency(frequencyCurrent);
  const frequencyMinText = formatFrequency(frequencyMin);
  const frequencyMaxText = formatFrequency(frequencyMax);

  const formatInteger = (value: number | null | undefined) =>
    value != null && Number.isFinite(value)
      ? integerFormatter.format(Number(value))
      : '—';

  const totalCoresText = formatInteger(totalCores);
  const physicalCoresText = formatInteger(data?.cpu_cores?.physical);
  const logicalCoresText = formatInteger(data?.cpu_cores?.logical);

  const statsDividerColor =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.08)';

  const statsBackground =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.04)'
      : 'rgba(0, 0, 0, 0.03)';

  const cardBorderColor =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(0, 0, 0, 0.08)';

  const stats = [
    {
      key: 'percent',
      label: 'درصد استفاده',
      value: `${percentFormatter.format(Math.round(cpuPercent))}٪`,
    },
    { key: 'freq-current', label: 'فرکانس فعلی', value: frequencyText },
    { key: 'freq-min', label: 'کمینه فرکانس', value: frequencyMinText },
    { key: 'freq-max', label: 'بیشینه فرکانس', value: frequencyMaxText },
    { key: 'physical', label: 'هسته‌های فیزیکی', value: physicalCoresText },
    { key: 'logical', label: 'هسته‌های منطقی', value: logicalCoresText },
    { key: 'total', label: 'مجموع هسته‌ها', value: totalCoresText },
  ];

  if (isLoading) {
    return (
      <Box sx={cardSx}>
        <Skeleton
          variant="text"
          width="60%"
          height={28}
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
            py: 2,
            border: `1px solid ${statsDividerColor}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {Array.from({ length: 7 }).map((_, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                py: 0.75,
                borderBottom:
                  index === 6 ? 'none' : `1px dashed ${statsDividerColor}`,
              }}
            >
              <Skeleton
                variant="text"
                width="55%"
                height={18}
                sx={{ borderRadius: 1 }}
              />
              <Skeleton
                variant="text"
                width="25%"
                height={20}
                sx={{ borderRadius: 1 }}
              />
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
          خطا در دریافت داده‌های پردازنده: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ ...cardSx, justifyContent: 'space-between' }}>
      <Typography
        variant="subtitle2"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontWeight: 600,
          color: 'var(--color-bg-primary)',
        }}
      >
        <Box component="span" sx={{ fontSize: 20 }}>
          📊
        </Box>
        استفاده پردازنده (بر حسب درصد)
      </Typography>

      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <AppGauge
          value={cpuPercent}
          min={0}
          max={100}
          startAngle={0}
          endAngle={360}
          innerRadius="60%"
          outerRadius="100%"
          cornerRadius="50%"
          valueFormatter={(value) =>
            `${percentFormatter.format(Math.round(value ?? 0))}٪`
          }
          sx={(theme) => ({
            [`& .${gaugeClasses.valueArc}`]: {
              fill: gaugeColor,
            },
            [`& .${gaugeClasses.referenceArc}`]: {
              fill: theme.palette.text.disabled,
            },
            [`& .${gaugeClasses.valueText}`]: {
              fontSize: 40,

              fontFamily: 'var(--font-vazir)',
              fontWeight: 700,
              fill: 'var(--color-text)',
            },
          })}
          width={chartSize}
          height={chartSize}
        />
      </Box>

      <Box
        sx={{
          width: '100%',
          bgcolor: statsBackground,
          borderRadius: 2,
          alignSelf: 'end',
          px: 2,
          py: 2,
          border: `1px solid ${statsDividerColor}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
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
              sx={{ fontWeight: 500, color: theme.palette.text.secondary }}
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
};

export default Cpu;
