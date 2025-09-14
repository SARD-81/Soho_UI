import { Box, Typography } from '@mui/material';

import { LineChart } from '@mui/x-charts';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { useEffect, useRef, useState } from 'react';
import { useNetwork } from '../hooks/useNetwork';
import '../index.css';

type History = Record<
  string,
  Array<{ time: number; upload: number; download: number }>
>;

const MAX_HISTORY_MS = 90 * 1000; // 1 minute 30 seconds

const Network = () => {
  const { data, isLoading, error } = useNetwork();

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

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, color: 'var(--color-primary)' }}>
        Network
      </Typography>
      {names.length === 0 ? (
        <LineChart
          height={250}
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
          }}
          sx={{
            [`& .${axisClasses.tickLabel}`]: { fill: 'var(--color-text)' },
            [`& .${axisClasses.line}`]: { stroke: 'var(--color-text)' },
            [`& .${axisClasses.label}`]: { fill: 'var(--color-text)' },
          }}
        />
      ) : (
        names.map((name) => {
          const unit = interfaces[name]?.bandwidth.unit ?? '';
          const now = Date.now();
          const elapsed = now - startTimeRef.current;
          const min = elapsed < MAX_HISTORY_MS ? startTimeRef.current : now - MAX_HISTORY_MS;
          const max = min + MAX_HISTORY_MS;

          return (
            <Box
              key={name}
              sx={{
                p: 2,
                bgcolor: 'var(--color-card-bg)',
                mb: 2,
                borderRadius: 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 1, color: 'var(--color-primary)' }}
              >
                {name}
              </Typography>
              <LineChart
                height={250}
                dataset={history[name] ?? []}
                loading={isLoading}
                skipAnimation
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
                    max: 15,
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
                    position: { vertical: 'top', horizontal: 'center' },
                  },
                  noDataOverlay: { message: 'No network data' },
                }}
                sx={{
                  [`& .${axisClasses.tickLabel}`]: {
                    fill: 'var(--color-text)',
                  },
                  [`& .${axisClasses.line}`]: { stroke: 'var(--color-text)' },
                  [`& .${axisClasses.label}`]: { fill: 'var(--color-text)' },
                }}
              />
            </Box>
          );
        })
      )}
    </Box>
  );
};

export default Network;
