import { Box, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

interface DashboardWidgetHeaderProps {
  icon: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
  sx?: SxProps<Theme>;
}

const DashboardWidgetHeader = ({
  icon,
  title,
  subtitle,
  status,
  actions,
  sx,
}: DashboardWidgetHeaderProps) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    spacing={2}
    sx={sx}
  >
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          border: '1px solid var(--color-divider)',
          backgroundColor: 'rgba(0, 198, 169, 0.08)',
          color: 'var(--color-primary)',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 900, color: 'var(--color-text)' }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
    </Stack>
    {(status || actions) && (
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
        {status}
        {actions}
      </Stack>
    )}
  </Stack>
);

export default DashboardWidgetHeader;
