import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    direction: 'rtl',
    typography: {
        fontFamily: 'var(--font-vazir)',
    },
    palette: {
        primary: {
            main: '#3f51b5',     // uses your CSS vars, but MUI expects values here
            light: '#6573c3',
            dark: '#2c387e',
        },
    },
});

export default theme;
