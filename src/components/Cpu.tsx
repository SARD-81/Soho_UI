import { Box, Stack, Typography } from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { useMemo } from 'react';
import { useCpu } from '../hooks/useCpu';

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const getGaugeColor = (value: number) => {
  const ratio = clampPercent(value) / 100;
  const red = Math.round(ratio * 255);
  const green = Math.round((1 - ratio) * 255);
  return `rgb(${red}, ${green}, 0)`;
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
  const gaugeColor = getGaugeColor(cpuPercent);

  const frequencyCurrent =
    data?.cpu_frequency?.current != null ? Number(data.cpu_frequency.current) : null;

  const hasPhysical = data?.cpu_cores?.physical != null;
  const hasLogical = data?.cpu_cores?.logical != null;
  const totalCores =
    hasPhysical || hasLogical
      ? Number(data?.cpu_cores?.physical ?? 0) + Number(data?.cpu_cores?.logical ?? 0)
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
        <Typography variant="body2">در حال بارگذاری اطلاعات پردازنده...</Typography>
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
          width: '100%',
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

      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Gauge
          value={cpuPercent}
          min={0}
          max={100}
          startAngle={-140}
          endAngle={140}
          innerRadius="60%"
          outerRadius="100%"
          cornerRadius="50%"
          valueFormatter={(value) =>
            `${percentFormatter.format(Math.round(value ?? 0))}٪`
          }
          sx={{
            [`& .${gaugeClasses.valueArc}`]: {
              fill: gaugeColor,
            },
            [`& .${gaugeClasses.referenceArc}`]: {
              fill: 'rgba(255, 255, 255, 0.12)',
            },
            [`& .${gaugeClasses.valueText}`]: {
              fontSize: 36,
              fontFamily: 'var(--font-vazir)',
              fontWeight: 700,
              fill: 'var(--color-bg-primary)',
            },
          }}
          width={220}
          height={220}
        />
      </Box>

      <Stack
        spacing={1}
        sx={{
          width: '100%',
          bgcolor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 2,
          p: 2,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography
          variant="body2"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 500 }}
        >
          <Box component="span" sx={{ color: 'var(--color-primary)' }}>
            فرکانس:
          </Box>
          <Box component="span">{frequencyText}</Box>
        </Typography>
        <Typography
          variant="body2"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 500 }}
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
