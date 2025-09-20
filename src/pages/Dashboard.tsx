import { Box } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import type { SxProps, Theme } from '@mui/material/styles';
import Cpu from '../components/Cpu';
import Disk, { DiskOverview } from '../components/Disk';
import Memory from '../components/Memory';
import Network from '../components/Network';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type ResponsiveSize = Partial<Record<Breakpoint, number>>;

type DashboardWidgetRenderer = () => JSX.Element;

interface DashboardWidget {
  id: string;
  component: DashboardWidgetRenderer;
  size?: ResponsiveSize;
}

const containerSx: SxProps<Theme> = {
  p: { xs: 2, md: 3 },
  fontFamily: 'var(--font-vazir)',
};

const gridContainerSx: SxProps<Theme> = {
  alignItems: 'stretch',
  alignContent: 'start',
};

const gridItemSx: SxProps<Theme> = {
  display: 'flex',
  minWidth: 0,
  '& > *': {
    flexGrow: 1,
    minWidth: 0,
  },
};

const dashboardWidgets: DashboardWidget[] = [
  {
    id: 'cpu',
    component: Cpu,
    size: { xs: 12, md: 6, xl: 3 },
  },
  {
    id: 'memory',
    component: Memory,
    size: { xs: 12, md: 6, xl: 3 },
  },
  {
    id: 'disk-overview',
    component: DiskOverview,
    size: { xs: 12, md: 12, xl: 6 },
  },
  {
    id: 'disk',
    component: Disk,
    size: { xs: 12, md: 12, xl: 6 },
  },
  {
    id: 'network',
    component: Network,
    size: { xs: 12, md: 12, xl: 6 },
  },
];

const Dashboard = () => {
  return (
    <Box sx={containerSx}>
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
        sx={gridContainerSx}
      >
        {dashboardWidgets.map(({ id, component: WidgetComponent, size }) => (
          <Grid
            key={id}
            xs={size?.xs ?? 12}
            sm={size?.sm}
            md={size?.md}
            lg={size?.lg}
            xl={size?.xl}
            sx={gridItemSx}
          >
            <WidgetComponent />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
