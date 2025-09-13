import { IconButton, type SxProps, type Theme } from '@mui/material';
import React from 'react';
import { LuMoon, LuSun } from 'react-icons/lu';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  fixed?: boolean;
  sx?: SxProps<Theme>;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ fixed = true, sx }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <IconButton
      onClick={toggleTheme}
      color="inherit"
      sx={{
        ...(fixed && {
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 9999,
        }),
        backgroundColor: 'var(--color-card-bg)',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          backgroundColor: 'var(--color-input-bg)',
        },
        ...sx,
      }}
    >
      {isDark ? (
        <LuSun size={20} color="#fff" />
      ) : (
        <LuMoon size={20} color="#000" />
      )}
    </IconButton>
  );
};

export default ThemeToggle;
