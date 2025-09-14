import { Box, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { useEffect, useState } from 'react';
import { useNetwork } from '../hooks/useNetwork';

type History = Record<string, Array<{ time: number; upload: number; download: number }>>;

const MAX_POINTS = 60;

const Network = () => {
  const { data, isLoading, error } = useNetwork();
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

  if (isLoading) return <Typography>Loading Network...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  if (!data?.interfaces) return null;

  return (
    <>
      {Object.entries(history).map(([name, dataset]) => (
        <Box key={name} sx={{ p: 2, bgcolor: 'var(--color-card-bg)', mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, color: 'var(--color-primary)' }}>
            {name}
          </Typography>
          <LineChart
            height={250}
            dataset={dataset}
            xAxis={[
              {
                dataKey: 'time',
                valueFormatter: (value) => new Date(value).toLocaleTimeString(),
                scaleType: 'time',
              },
            ]}
            series={[
              { dataKey: 'download', label: 'دانلود', color: '#00bcd4' },
              { dataKey: 'upload', label: 'آپلود', color: '#ff4d94' },
            ]}
            margin={{ left: 40, right: 20, top: 20, bottom: 20 }}
            slotProps={{ legend: { position: { vertical: 'top', horizontal: 'center' } } }}
          />
        </Box>
      ))}
    </>
  );
};

export default Network;
