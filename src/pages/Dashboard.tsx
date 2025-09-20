import { Box } from '@mui/material';
import type { ComponentType } from 'react';
import Cpu from '../components/Cpu';
import Disk, { DiskOverview } from '../components/Disk';
import Memory from '../components/Memory';
import Network from '../components/Network';

type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type ResponsiveSpanConfig = Partial<Record<BreakpointKey, number>>;

interface DashboardWidget {
  id: string;
  component: ComponentType;
  columns?: ResponsiveSpanConfig;
  rows?: ResponsiveSpanConfig;
  minHeight?: number;
}

const BREAKPOINT_ORDER: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const FULL_WIDTH_COLUMNS = 12;
const DEFAULT_ROW_SPAN = 1;

const clampSpan = (value: number, max: number) => {
  if (!Number.isFinite(value)) {
    return 1;
  }

  const rounded = Math.floor(value);
  return Math.min(Math.max(rounded, 1), max);
};

const createResponsiveSpan = (
  spans: ResponsiveSpanConfig | undefined,
  defaultSpan: number,
  maxSpan = FULL_WIDTH_COLUMNS
) => {
  let currentSpan = spans?.xs ?? defaultSpan;

  return BREAKPOINT_ORDER.reduce(
    (acc, breakpoint, index) => {
      if (index === 0) {
        acc[breakpoint] = `span ${clampSpan(currentSpan, maxSpan)}`;
        return acc;
      }

      const nextSpan = spans?.[breakpoint];
      if (nextSpan != null) {
        currentSpan = nextSpan;
      }

      acc[breakpoint] = `span ${clampSpan(currentSpan, maxSpan)}`;

      return acc;
    },
    {} as Record<BreakpointKey, string>
  );
};

// Add new widgets here and the grid will automatically position them based on the
// responsive column/row definitions.
const dashboardWidgets: DashboardWidget[] = [
  {
    id: 'cpu',
    component: Cpu,
    columns: { xs: 12, md: 6, xl: 3 },
  },
  {
    id: 'memory',
    component: Memory,
    columns: { xs: 12, md: 6, xl: 3 },
  },
  {
    id: 'disk-overview',
    component: DiskOverview,
    columns: { xs: 12, md: 12, xl: 6 },
  },
  {
    id: 'disk',
    component: Disk,
    columns: { xs: 12 },
  },
  {
    id: 'network',
    component: Network,
    columns: { xs: 12 },
  },
];

const Dashboard = () => {
  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        fontFamily: 'var(--font-vazir)',
        display: 'grid',
        gap: { xs: 2, md: 3 },
        gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
        gridAutoFlow: 'dense',
        width: '100%',
      }}
    >
      {dashboardWidgets.map(
        ({ id, component: WidgetComponent, columns, rows, minHeight }) => {
          const columnStyles = createResponsiveSpan(
            columns,
            FULL_WIDTH_COLUMNS
          );
          const rowStyles = rows
            ? createResponsiveSpan(
                rows,
                DEFAULT_ROW_SPAN,
                Number.MAX_SAFE_INTEGER
              )
            : undefined;

          return (
            <Box
              key={id}
              sx={{
                gridColumn: columnStyles,
                gridRow: rowStyles,
                minHeight,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                minWidth: 0,
              }}
            >
              <WidgetComponent />
            </Box>
          );
        }
      )}
    </Box>
  );
};

export default Dashboard;
