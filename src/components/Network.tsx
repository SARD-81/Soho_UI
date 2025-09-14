import { Box, Button, Stack, Typography } from '@mui/material';

import { LineChart } from '@mui/x-charts';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { useEffect, useState } from 'react';
import { useNetwork } from '../hooks/useNetwork';
import '../index.css';

type History = Record<
  string,
  Array<{ time: number; upload: number; download: number }>
>;

const MAX_POINTS = 60;
const axisColor = 'var(--color-text)';

type History = Record<string, Array<{ time: number; upload: number; download: number }>>;

const MAX_POINTS = 60;

type History = Record<string, Array<{ time: number; upload: number; download: number }>>;

const MAX_POINTS = 60;

const Network = () => {
  const [running, setRunning] = useState(true);
  const { data, isLoading, error } = useNetwork(running);

  const [history, setHistory] = useState<History>({});

  useEffect(() => {
    if (!data?.interfaces) return;
    setHistory((prev) => {
      const next: History = { ...prev };
      Object.entries(data.interfaces).forEach(([name, { bandwidth }]) => {
        const points = next[name] ? [...next[name]] : [];
        points.push({
          time: Date.now(),
          upload: bandwidth.upload,
          download: bandwidth.download,
        });
        if (points.length > MAX_POINTS) points.shift();
        next[name] = points;
      });
      return next;
    });
  }, [data]);

  const handleReset = () => setHistory({});


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
            { dataKey: 'download', label: 'دانلود', color: '#00bcd4', showMark: false },
            { dataKey: 'upload', label: 'آپلود', color: '#ff4d94', showMark: false },

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
          return (
            <Box key={name} sx={{ p: 2, bgcolor: 'var(--color-card-bg)', mb: 2, borderRadius: 1 }}>
              <Typography variant="h6" sx={{ mb: 1, color: 'var(--color-primary)' }}>
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
                    valueFormatter: (value) => new Date(value).toLocaleTimeString(),
                    scaleType: 'time',
                  },
                ]}
                yAxis={[
                  {
                    label: unit,
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
                  legend: { position: { vertical: 'top', horizontal: 'center' } },
                  noDataOverlay: { message: 'No network data' },
                }}
                sx={{
                  [`& .${axisClasses.tickLabel}`]: { fill: 'var(--color-text)' },
                  [`& .${axisClasses.line}`]: { stroke: 'var(--color-text)' },
                  [`& .${axisClasses.label}`]: { fill: 'var(--color-text)' },
                }}
              />
            </Box>
          );
        })
      )}
      <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
        <Button size="small" variant="contained" onClick={() => setRunning((p) => !p)}>
          {running ? 'Stop' : 'Start'}
        </Button>
        <Button size="small" variant="outlined" onClick={handleReset}>
          Reset
        </Button>
      </Stack>

    </Box>
  );
};

export default Network;
