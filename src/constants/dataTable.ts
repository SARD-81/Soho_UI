import type { SxProps, Theme } from '@mui/material/styles';

export const defaultContainerSx: SxProps<Theme> = {
  mt: 4,
  borderRadius: '5px',
  backgroundColor: 'var(--color-card-bg)',
  border: '1px solid var(--color-input-border)',
  boxShadow: '0 18px 40px -24px rgba(0, 0, 0, 0.35)',
  overflow: 'hidden',
};

export const defaultHeadRowSx: SxProps<Theme> = {
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-text)',
  fontWeight: 500,
  fontSize: '0.85rem',
  height: 2,
  borderBottom: 'none',
};

export const defaultBodyRowSx: SxProps<Theme> = {
  '&:last-of-type .MuiTableCell-root': {
    borderBottom: 'none',
  },
  '& .MuiTableCell-root': {
    borderBottom: '1px solid var(--color-input-border)',
    fontSize: '0.92rem',
  },
  '&:hover': {
    backgroundColor:
      'color-mix(in srgb, var(--color-primary) 12%, transparent)',
    transition: 'background-color 0.2s ease',
  },
};

export const defaultHeaderCellSx: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: '0.95rem',
};

export const defaultBodyCellSx: SxProps<Theme> = {
  color: 'var(--color-text)',
};

export const baseTableSx: SxProps<Theme> = { minWidth: 720 };
