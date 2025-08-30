import React from 'react';
import { IconButton } from '@mui/material';
import { LuMoon, LuSun } from 'react-icons/lu';  // Moon and Sun icons for toggle
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <IconButton
            onClick={toggleTheme}
            color="inherit"
            sx={{
                position: 'fixed',
                top: 16,
                left: 16,
                zIndex: 9999,
                backgroundColor: 'var(--color-card-bg)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                    backgroundColor: 'var(--color-input-bg)',
                },
            }}
        >
            {isDark ? <LuSun size={20} color="#fff" /> : <LuMoon size={20} color="#000" />}
        </IconButton>
    );
};

export default ThemeToggle;