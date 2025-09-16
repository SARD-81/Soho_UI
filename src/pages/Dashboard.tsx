import { Box } from '@mui/material';
import Cpu from '../components/Cpu';
import Disk from '../components/Disk';
import Memory from '../components/Memory';
import Network from '../components/Network';

const Dashboard = () => {
  return (
    <Box
      sx={{
        p: 3,
        fontFamily: 'var(--font-vazir)',
        display: 'flex',
        // flexDirection: 'column',
      }}
    >
      <Box>
        <Cpu />
      </Box>
      <Box>
        <Memory />
      </Box>
      <Box sx={{ width: '100%', flexGrow: 1 }}>
        <Network />
      </Box>
      <Box>
        <Disk />
      </Box>
    </Box>
  );
};

export default Dashboard;
