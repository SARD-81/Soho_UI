import { Box, Typography } from '@mui/material';
import { useCpu } from '../hooks/useCpu';

const Cpu = () => {
  const { data, isLoading, error } = useCpu();

  if (isLoading) return <Typography>Loading CPU...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  return (
    <Box sx={{ p: 2, bgcolor: 'var(--color-card-bg)', mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, color: 'var(--color-primary)' }}>
        CPU
      </Typography>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Box>
  );
};

export default Cpu;
