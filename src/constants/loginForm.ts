import type { SxProps, Theme } from '@mui/material';

export const loginTextFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '5px',
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-input-bg)',
    border: '1px solid var(--color-input-border)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'var(--color-input-bg)',
      borderColor: 'var(--color-primary-light)',
    },
    '&.Mui-focused': {
      backgroundColor: 'var(--color-input-bg)',
      borderColor: 'var(--color-primary)',
      boxShadow: '0 0 0 3px rgba(126, 87, 194, 0.1)',
    },
    '&.Mui-error': {
      borderColor: 'var(--color-error)',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '12px 14px',
  },
};
