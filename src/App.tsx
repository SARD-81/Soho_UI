import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { RouterProvider } from 'react-router';
import AppToaster from './components/AppToaster.tsx';
import GlobalLoader from './components/GlobalLoader.tsx';
import { useTheme } from './contexts/ThemeContext';
import router from './routes/Routes';
import getTheme from './theme';
import { useEffect } from 'react';
import {
  installPerfDump,
  setupLongTaskObserver,
} from './utils/perfProbe';

function App() {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  useEffect(() => {
  installPerfDump();
  return setupLongTaskObserver();
}, []);

  return (
    <MUIThemeProvider theme={theme}>
      <AppToaster />
      <GlobalLoader />
      <RouterProvider router={router} />
    </MUIThemeProvider>
  );
}

export default App;
