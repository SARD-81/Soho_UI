import { Box, Typography } from '@mui/material';
import { useNetwork } from '../hooks/useNetwork';

const Network = () => {
  const { data, isLoading, error } = useNetwork();

  if (isLoading) return <Typography>Loading Network...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  return (
    <Box sx={{ p: 2, bgcolor: 'var(--color-card-bg)', mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, color: 'var(--color-primary)' }}>
        Network
      </Typography>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Box>
  );
};

export default Network;
