import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export interface SectionHeaderProps {
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
}

/**
 * Icon + title + description header shared by every settings card.
 *
 * No `direction` / `textAlign: 'right'` here on purpose: `stylis-plugin-rtl`
 * mirrors physical values, so those overrides used to force the Persian text
 * back into LTR ordering. Logical properties only.
 */
const SectionHeader = ({
  icon,
  title,
  description,
  action,
}: SectionHeaderProps) => (
  <Stack
    direction={{ xs: 'column', sm: 'row' }}
    alignItems={{ xs: 'stretch', sm: 'flex-start' }}
    justifyContent="space-between"
    gap={1.5}
    sx={{ mb: 2.25 }}
  >
    <Stack
      direction="row"
      alignItems="flex-start"
      gap={1.25}
      sx={{ minWidth: 0, flex: 1 }}
    >
      <Box
        aria-hidden
        sx={{
          width: 42,
          height: 42,
          borderRadius: '12px',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--color-primary)',
          backgroundColor:
            'color-mix(in srgb, var(--color-primary) 11%, transparent)',
          border:
            '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1, textAlign: 'start' }}>
        <Typography
          component="h3"
          sx={{
            m: 0,
            color: 'var(--color-text)',
            fontWeight: 800,
            fontSize: '0.98rem',
            lineHeight: 1.9,
            textAlign: 'start',
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'var(--color-secondary)',
            mt: 0.25,
            fontSize: '0.78rem',
            lineHeight: 1.95,
            textAlign: 'start',
          }}
        >
          {description}
        </Typography>
      </Box>
    </Stack>
    {action ? (
      <Box
        sx={{
          flexShrink: 0,
          alignSelf: { xs: 'flex-start', sm: 'center' },
        }}
      >
        {action}
      </Box>
    ) : null}
  </Stack>
);

export default SectionHeader;
