import AuthPage from "./pages/AuthPage.tsx";
import { useTheme } from "./contexts/ThemeContext";
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import getTheme from "./theme";

function AppContent() {
    const { isDark } = useTheme();
    const theme = getTheme(isDark);

    return (
        <MUIThemeProvider theme={theme}>
            <CssBaseline />
            <AuthPage/>
        </MUIThemeProvider>
    );
}

function App() {
    return <AppContent />;
}

export default App;