import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { RouterProvider } from 'react-router';
import AppToaster from './components/AppToaster.tsx';
import { useTheme } from './contexts/ThemeContext';
import router from './routes/Routes';
import getTheme from './theme';

function AppContent() {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  return (
    <MUIThemeProvider theme={theme}>
      <AppToaster />
      <RouterProvider router={router} />
    </MUIThemeProvider>
  );
}

function App() {
  return <AppContent />;
}

export default App;
