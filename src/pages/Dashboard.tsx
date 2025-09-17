import { Box } from '@mui/material';
import Cpu from '../components/Cpu';
import Disk, { DiskOverview } from '../components/Disk';
import Memory from '../components/Memory';
import Network from '../components/Network';

const Dashboard = () => {
  return (
    <Box
      sx={{
        p: 3,
        fontFamily: 'var(--font-vazir)',
        display: 'grid',
        gap: 3,
        gridTemplateColumns: {
          xs: 'repeat(1, minmax(0, 1fr))',
          md: 'repeat(12, minmax(0, 1fr))',
        },
      }}
    >
      <Box
        sx={{
          gridColumn: { xs: '1 / -1', md: 'span 6', lg: 'span 2' },
          display: 'flex',
          width: '100%',
        }}
      >
        <Cpu />
      </Box>
      <Box
        sx={{
          gridColumn: { xs: '1 / -1', md: 'span 6', lg: 'span 2' },
          display: 'flex',
          width: '100%',
        }}
      >
        <Memory />
      </Box>
      <Box
        sx={{
          gridColumn: { xs: '1 / -1', md: '1 / -1', lg: 'span 8' },
          display: 'flex',
          width: '100%',
        }}
      >
        <DiskOverview />
      </Box>
      <Box
        sx={{
          gridColumn: '1 / -1',
          display: 'flex',
          width: '100%',
        }}
      >
        <Disk />
      </Box>
      <Box
        sx={{
          gridColumn: '1 / -1',
          display: 'flex',
          width: '100%',
        }}
      >
        <Network />
      </Box>
    </Box>
  );
};

export default Dashboard;
