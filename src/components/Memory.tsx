import { Box, Typography } from '@mui/material';
import { useMemory } from '../hooks/useMemory';

const Memory = () => {
  const { data, isLoading, error } = useMemory();

  if (isLoading) return <Typography>Loading Memory...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  return (
    <Box sx={{ p: 2, bgcolor: 'var(--color-card-bg)', mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, color: 'var(--color-primary)' }}>
        Memory
      </Typography>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Box>
  );
};

export default Memory;
