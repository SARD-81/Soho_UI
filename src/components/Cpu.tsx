import {
  Box,
  GlobalStyles,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { useMemo } from 'react';
import { clampPercent, getGaugeColor } from '../constants/components/cpu';
import { useCpu } from '../hooks/useCpu';
import { createCardSx } from './cardStyles';

const Cpu = () => {
  const { data, isLoading, error } = useCpu();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const chartSize = isSmallScreen ? 150 : 260;

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

  const cardSx = {
    ...createCardSx(theme),
    alignItems: 'center',
  } as const;

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
        <Typography variant="body2">
          در حال بارگذاری اطلاعات پردازنده...
        </Typography>
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
    <Box sx={cardSx}>
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
        <GlobalStyles
          styles={{
            // Force the center number in the Gauge to your token, including split tspans
            '.MuiGauge-valueText, .MuiGauge-valueText tspan': {
              fill: 'var(--color-text) !important',
              color: 'var(--color-text) !important',
            },
          }}
        />
        <Gauge
          value={cpuPercent}
          min={0}
          max={100}
          startAngle={0}
          endAngle={360}
          innerRadius="60%"
          outerRadius="100%"
          cornerRadius="50%"
          text={({ value }) =>
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
