import type { SxProps, Theme } from '@mui/material';

/**
 * Shared tab shell styles.
 *
 * IMPORTANT (RTL): styles here pass through `stylis-plugin-rtl`
 * (see `src/rtl-cache.ts`), which mirrors every physical declaration.
 * A hand written `direction: 'rtl'` becomes `direction: ltr` in the browser,
 * `text-align: right` becomes `left`, and `flex-direction: row-reverse`
 * becomes `row`. That is what forced every tab panel (and every table inside
 * it) back into LTR ordering.
 *
 * Direction is now expressed with the HTML `dir` attribute in the page shell,
 * which stylis cannot touch. Only logical properties are used below.
 */

export const tabContainerSx: SxProps<Theme> = {
  color: 'var(--color-text)',
  borderRadius: '16px',
  background:
    'linear-gradient(180deg, color-mix(in srgb, var(--color-card-bg) 96%, var(--color-primary) 4%) 0%, var(--color-card-bg) 100%)',
  boxShadow: '0 26px 70px -48px rgba(0, 0, 0, 0.72)',
  border: '1px solid color-mix(in srgb, var(--color-primary) 14%, transparent)',
  overflow: 'hidden',
};

export const tabListSx: SxProps<Theme> = {
  px: { xs: 1.25, sm: 2.5 },
  pt: 1.25,
  minHeight: 56,
  color: 'var(--color-text)',
  backgroundColor:
    'color-mix(in srgb, var(--color-background) 58%, transparent)',
  backdropFilter: 'blur(8px)',
  borderBottom:
    '1px solid color-mix(in srgb, var(--color-primary) 12%, transparent)',
  '& .MuiTabs-list': {
    gap: 0.75,
  },
  '& .MuiTabs-flexContainer': {
    gap: 0.75,
  },
  '& .MuiTab-root': {
    color: 'var(--color-secondary)',
    fontWeight: 700,
    fontSize: '0.88rem',
    minHeight: 46,
    borderRadius: '10px 10px 0 0',
    px: { xs: 1.75, sm: 2.5 },
    textTransform: 'none',
    transition: 'color 0.2s ease, background-color 0.2s ease',
    '& .MuiTab-icon': {
      marginInlineEnd: '8px',
      marginBottom: 0,
      marginRight: 0,
      marginLeft: 0,
      display: 'flex',
    },
    '&:hover': {
      color: 'var(--color-text)',
      backgroundColor:
        'color-mix(in srgb, var(--color-primary) 7%, transparent)',
    },
    '&.Mui-selected': {
      color: 'var(--color-primary)',
      backgroundColor:
        'color-mix(in srgb, var(--color-primary) 12%, transparent)',
    },
    '&.Mui-focusVisible': {
      outline: '2px solid var(--color-primary)',
      outlineOffset: '-2px',
    },
  },
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '8px 8px 0 0',
    background:
      'linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
  },
  '& .MuiTabs-scrollButtons': {
    color: 'var(--color-text)',
    '&.Mui-disabled': { opacity: 0.3 },
  },
};

export const tabPanelSx: SxProps<Theme> = {
  p: { xs: 1.5, md: 2.5 },
  color: 'var(--color-text)',
  backgroundColor: 'var(--color-card-bg)',
  borderRadius: '0 0 16px 16px',
};
