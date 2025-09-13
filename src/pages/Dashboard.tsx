import { Box, Grid, Paper, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { ScatterChart } from '@mui/x-charts/ScatterChart';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const pieData = [
    { id: 0, value: 10, label: 'A' },
    { id: 1, value: 20, label: 'B' },
    { id: 2, value: 15, label: 'C' },
  ];

  const barData = [
    { month: 'فروردین', value: 30 },
    { month: 'اردیبهشت', value: 40 },
    { month: 'خرداد', value: 25 },
  ];

  const [lineSeries1, setLineSeries1] = useState([20, 35, 40]);
  const lineSeries2 = [15, 25, 30, 45, 35, 50, 60];
  const [gaugeValue, setGaugeValue] = useState(60);
  // Repeat for barData, pieData, scatterData…

  const scatterData = [
    { x: 1, y: 5 },
    { x: 2, y: 15 },
    { x: 3, y: 9 },
    { x: 4, y: 20 },
    { x: 5, y: 12 },
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setLineSeries1((prev) => [...prev.slice(-9), Math.random() * 100]);
      setGaugeValue(() => Math.round(Math.random() * 100));
    }, 1000);
    return () => clearInterval(id); // cleanup on unmount
  }, []);

  return (
    <Box sx={{ p: 3, fontFamily: 'var(--font-vazir)' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, bgcolor: 'var(--color-card-bg)' }}>
            <Typography
              variant="subtitle1"
              sx={{ mb: 1, color: 'var(--color-primary)' }}
            >
              نمودار دونات
            </Typography>
            <PieChart
              series={[{ data: pieData, innerRadius: 30, outerRadius: 80 }]}
              height={200}
              slotProps={{ legend: { hidden: true } }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, bgcolor: 'var(--color-card-bg)' }}>
            <Typography
              variant="subtitle1"
              sx={{ mb: 1, color: 'var(--color-primary)' }}
            >
              نمودار دایره‌ای
            </Typography>
            <PieChart
              series={[{ data: pieData }]}
              height={200}
              slotProps={{ legend: { hidden: true } }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, bgcolor: 'var(--color-card-bg)' }}>
            <Typography
              variant="subtitle1"
              sx={{ mb: 1, color: 'var(--color-primary)' }}
            >
              گیج
            </Typography>
            <Gauge
              value={gaugeValue}
              startAngle={-90}
              endAngle={90}
              height={200}
              sx={{
                [`& .${gaugeClasses.valueText}`]: {
                  fill: 'var(--color-primary)',
                },
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, bgcolor: 'var(--color-card-bg)' }}>
            <Typography
              variant="subtitle1"
              sx={{ mb: 1, color: 'var(--color-primary)' }}
            >
              نمودار ستونی
            </Typography>
            <BarChart
              xAxis={[{ scaleType: 'band', data: barData.map((d) => d.month) }]}
              series={[{ data: barData.map((d) => d.value) }]}
              height={200}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: 'var(--color-card-bg)' }}>
            <Typography
              variant="subtitle1"
              sx={{ mb: 1, color: 'var(--color-primary)' }}
            >
              نمودار خطی
            </Typography>
            <LineChart
              xAxis={[{ data: ['1', '2', '3', '4', '5', '6', '7'] }]}
              series={[
                { data: lineSeries1, label: 'داده ۱' },
                { data: lineSeries2, label: 'داده ۲' },
              ]}
              height={300}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: 'var(--color-card-bg)' }}>
            <Typography
              variant="subtitle1"
              sx={{ mb: 1, color: 'var(--color-primary)' }}
            >
              نمودار پراکندگی
            </Typography>
            <ScatterChart
              xAxis={[{ min: 0, max: 6 }]}
              yAxis={[{ min: 0, max: 25 }]}
              series={[{ data: scatterData }]}
              height={300}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
