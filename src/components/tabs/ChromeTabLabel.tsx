import { Box, Typography } from '@mui/material';

interface ChromeTabLabelProps {
  label: string;
}

const ChromeTabLabel = ({ label }: ChromeTabLabelProps) => (
  <Box
    sx={{
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 1,
      px: 1,
      py: 0.5,
      fontWeight: 700,
      color: 'inherit',
      lineHeight: 1.2,
    }}
  >
    <Box component="span" className="tab-edge left" />
    <Typography component="span" sx={{ color: 'inherit', fontWeight: 'inherit' }}>
      {label}
    </Typography>
    <Box component="span" className="tab-edge right" />
  </Box>
);

export default ChromeTabLabel;
