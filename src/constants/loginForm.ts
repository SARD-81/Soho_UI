import type { SxProps, Theme } from '@mui/material';

export const loginTextFieldSx: SxProps<Theme> = {
  '& .MuiInputLabel-root': {
    color: 'var(--color-secondary)',
    fontFamily: 'var(--font-vazir)',
    fontWeight: 600,
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'var(--color-primary)',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '18px',
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-input-bg)',
    border: '1px solid var(--color-input-border)',
    transition: 'border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover': {
      borderColor: 'var(--color-primary-light)',
      transform: 'translateY(-1px)',
    },
    '&:hover fieldset': {
      borderColor: 'transparent',
    },
    '&.Mui-focused': {
      borderColor: 'var(--color-primary)',
      boxShadow: '0 0 0 4px rgba(99, 182, 219, 0.16)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'transparent',
    },
    '&.Mui-error': {
      borderColor: 'var(--color-error)',
      boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.12)',
    },
    '&.Mui-error fieldset': {
      borderColor: 'transparent',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '14px 14px',
    fontFamily: 'var(--font-vazir)',
  },
  '& .MuiFormHelperText-root': {
    mx: 1.5,
    mt: 0.8,
    fontFamily: 'var(--font-vazir)',
    fontSize: 12,
  },
};
