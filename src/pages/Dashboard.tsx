import { Box } from '@mui/material';
import Cpu from '../components/Cpu';
import Disk from '../components/Disk';
import Memory from '../components/Memory';
import Network from '../components/Network';

const Dashboard = () => {
  return (
    <Box sx={{ p: 3, fontFamily: 'var(--font-vazir)' }}>
      <Cpu />
      <Disk />
      <Memory />
      <Network />
    </Box>
  );
};

export default Dashboard;
