import { createTheme } from '@mui/material/styles';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { legendClasses } from '@mui/x-charts/ChartsLegend';
import '@mui/x-charts/themeAugmentation';

function readCssVar(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

// Function to get theme based on mode
export const getTheme = (isDark: boolean) => {
  const primaryMain = readCssVar('--color-primary', '#00c6a9');
  const primaryLight = readCssVar('--color-primary-light', '#3ec6b6');
  const secondaryMain = readCssVar('--color-secondary', '#ffd86b');
  const secondaryDark = readCssVar('--color-secondary-dark', '#e6c344');
  const bgDefault = readCssVar('--color-bg', isDark ? '#121212' : '#ffffff');
  const textPrimary = readCssVar(
    '--color-text',
    isDark ? '#e0e0e0' : '#1f1f1f'
  );
  const fontFamily = readCssVar('--font-vazir', 'Vazirmatn, Vazir, sans-serif');

  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: { main: primaryMain, light: primaryLight },
      secondary: { main: secondaryMain, dark: secondaryDark },
      background: {
        default: bgDefault,
        paper: isDark ? 'rgba(30, 30, 30, 0.92)' : 'rgba(255, 255, 255, 0.92)',
      },
      text: { primary: textPrimary },
    },
    typography: {
      fontFamily,
    },
    components: {
      MuiChartsAxis: {
        styleOverrides: {
          root: {
            [`& .${axisClasses.tickLabel}`]: { fill: 'var(--color-text)' },
            [`& .${axisClasses.line}`]: { stroke: 'var(--color-text)' },
            [`& .${axisClasses.label}`]: { fill: 'var(--color-text)' },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isDark
              ? 'rgba(30, 30, 30, 0.92)'
              : 'rgba(255, 255, 255, 0.92)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDark
                ? 'rgba(45, 45, 45, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.12)'
                : 'rgba(0, 0, 0, 0.12)',
            },
          },
        },
      },
      MuiChartsLegend: {
        styleOverrides: {
          root: {
            [`& .${legendClasses.label}`]: { fill: 'var(--color-text)' },
          },
        },
      },
    },
  });
};

export default getTheme;
