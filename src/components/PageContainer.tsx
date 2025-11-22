import { Box, type SxProps, type Theme } from '@mui/material';
import type { PropsWithChildren } from 'react';

interface PageContainerProps extends PropsWithChildren {
  sx?: SxProps<Theme>;
}

const PageContainer = ({ children, sx }: PageContainerProps) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      width: '100%',
      ...sx,
    }}
  >
    {children}
  </Box>
);

export default PageContainer;
