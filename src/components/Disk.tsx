import { Box, Typography } from '@mui/material';
import { useDisk } from '../hooks/useDisk';

const Disk = () => {
  const { data, isLoading, error } = useDisk();

  if (isLoading) return <Typography>Loading Disk...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  return (
    <Box sx={{ p: 2, bgcolor: 'var(--color-card-bg)', mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, color: 'var(--color-primary)' }}>
        Disk
      </Typography>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Box>
  );
};

export default Disk;
