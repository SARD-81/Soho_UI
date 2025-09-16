import { Box, Stack, Typography } from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { useMemo } from 'react';
import { useCpu } from '../hooks/useCpu';

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

type RgbColor = { r: number; g: number; b: number };

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

  const hasPhysical = data?.cpu_cores?.physical != null;
  const hasLogical = data?.cpu_cores?.logical != null;
  const totalCores =
    hasPhysical || hasLogical
      ? Number(data?.cpu_cores?.physical ?? 0) +
        Number(data?.cpu_cores?.logical ?? 0)
      : null;

  const frequencyText =
    frequencyCurrent != null && Number.isFinite(frequencyCurrent)
      ? `${frequencyFormatter.format(frequencyCurrent)} MHz`
      : '—';

  const totalCoresText =
    totalCores != null && Number.isFinite(totalCores)
      ? integerFormatter.format(totalCores)
      : '—';

  if (isLoading) {
    return (
      <Box
        sx={{
          p: 3,
          bgcolor: 'var(--color-card-bg)',
          borderRadius: 3,
          mb: 3,
          color: 'var(--color-bg-primary)',
        }}
      >
        <Typography variant="body2">
          در حال بارگذاری اطلاعات پردازنده...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 3,
          bgcolor: 'var(--color-card-bg)',
          borderRadius: 3,
          mb: 3,
          color: 'var(--color-bg-primary)',
        }}
      >
        <Typography variant="body2" sx={{ color: 'var(--color-error)' }}>
          خطا در دریافت داده‌های پردازنده: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 'fit-content',
        p: 3,
        bgcolor: 'var(--color-card-bg)',
        borderRadius: 3,
        mb: 3,
        color: 'var(--color-bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.18)',
      }}
    >
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

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Gauge
          value={cpuPercent}
          min={0}
          max={100}
          startAngle={-180}
          endAngle={180}
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
          width={200}
          height={200}
        />
      </Box>

      <Stack
        spacing={1}
        sx={{
          // width: '100%',
          bgcolor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 2,
          p: 2,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 500,
          }}
        >
          <Box component="span" sx={{ color: 'var(--color-primary)' }}>
            فرکانس:
          </Box>
          <Box component="span">{frequencyText}</Box>
        </Typography>
        <Typography
          variant="body2"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 500,
          }}
        >
          <Box component="span" sx={{ color: 'var(--color-primary)' }}>
            مجموع هسته‌های فیزیکی و منطقی:
          </Box>
          <Box component="span">{totalCoresText}</Box>
        </Typography>
      </Stack>
    </Box>
  );
};

export default Cpu;
