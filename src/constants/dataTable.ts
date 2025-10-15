import type { SxProps, Theme } from '@mui/material/styles';
import '../index.css';

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
  transition: 'background-color 0.2s ease, box-shadow 0.2s ease, outline 0.2s ease',
  '&:hover': {
    backgroundColor:
      'color-mix(in srgb, var(--color-primary) 12%, transparent)',
    transition: 'background-color 0.2s ease',
  },
  '&.Mui-selected': {
    background:
      'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 14%, transparent) 0%, color-mix(in srgb, var(--color-primary) 28%, transparent) 100%)',
    boxShadow:
      'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 35%, transparent)',
  },
  '&.Mui-selected:hover': {
    background:
      'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 18%, transparent) 0%, color-mix(in srgb, var(--color-primary) 32%, transparent) 100%)',
  },
  '&:focus-visible': {
    outline: '2px solid color-mix(in srgb, var(--color-primary) 40%, transparent)',
    outlineOffset: -2,
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
