import { createTheme } from '@mui/material/styles';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { labelClasses } from '@mui/x-charts/ChartsLabel';
import { legendClasses } from '@mui/x-charts/ChartsLegend';
import type {} from '@mui/x-charts/themeAugmentation';

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
  const tooltipSurface = isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(15, 23, 42, 0.94)';
  const tooltipBorder = isDark ? 'rgba(148, 163, 184, 0.35)' : 'rgba(148, 163, 184, 0.45)';
  const tooltipGlow = isDark
    ? '0 18px 45px rgba(8, 47, 73, 0.55), 0 6px 18px rgba(8, 47, 73, 0.35)'
    : '0 18px 45px rgba(8, 47, 73, 0.45), 0 6px 18px rgba(8, 47, 73, 0.25)';
  const tooltipAccent = isDark ? '#38bdf8' : '#0ea5e9';
  const tooltipAccentSoft = isDark ? 'rgba(56, 189, 248, 0.28)' : 'rgba(14, 165, 233, 0.24)';
  const tooltipText = isDark ? '#e2e8f0' : '#e0f2fe';

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
      MuiChartsTooltip: {
        styleOverrides: {
          // affect both the "key" and "value" cells
          cell: {
            '&.MuiChartsTooltip-labelCell, &.MuiChartsTooltip-valueCell': {
              color: 'var(--color-text)',
              // optional:
              // fontFamily: 'var(--font-vazir)',
            },
          },
          // header value for axis tooltips
          axisValueCell: { color: 'var(--color-text)' },
        },
      },
      MuiChartsAxis: {
        styleOverrides: {
          root: {
            [`& .${axisClasses.tickLabel}`]: { fill: 'var(--color-text)' },
            [`& .${axisClasses.line}`]: { stroke: 'var(--color-text)' },
            [`& .${axisClasses.label}`]: { fill: 'var(--color-text)' },
            [`& .${labelClasses.root}`]: { fill: 'var(--color-text)' },
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
            [`& .${legendClasses.label}`]: {
              fill: 'var(--color-text)',
              fontSize: '14px',
              fontFamily: fontFamily,
            },
            [`& .${legendClasses.mark}`]: {},
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: tooltipSurface,
            color: tooltipText,
            borderRadius: '7px',
            padding: '8px 12px',
            fontWeight: 600,
            fontSize: '0.72rem',
            letterSpacing: '0.015em',
            lineHeight: 1,
            border: `1px solid ${tooltipBorder}`,
            boxShadow: `${tooltipGlow}, inset 0 1px 0 rgba(255, 255, 255, 0.06)`,
            backdropFilter: 'blur(12px) saturate(1.1)',
            backgroundImage:
              `linear-gradient(145deg, ${tooltipAccentSoft}, rgba(16, 185, 129, 0.18)), linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0))`,
            transformOrigin: 'center top',
            transition: 'transform 150ms ease, opacity 150ms ease, box-shadow 150ms ease',
            boxSizing: 'border-box',
          },
          arrow: {
            color: tooltipSurface,
            '&::before': {
              border: `1px solid ${tooltipBorder}`,
              boxShadow: tooltipGlow,
              background: tooltipSurface,
            },
            filter: 'drop-shadow(0 6px 12px rgba(15, 23, 42, 0.45))',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              background: `radial-gradient(circle at 50% 0%, ${tooltipAccent} 0%, transparent 65%)`,
              opacity: 0.15,
            },
          },
        },
      },
    },
  });
};

export default getTheme;