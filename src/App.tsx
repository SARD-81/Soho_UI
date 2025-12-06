import { Suspense, useEffect } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { RouterProvider } from 'react-router';
import AppToaster from './components/AppToaster.tsx';
import GlobalLoader from './components/GlobalLoader.tsx';
import LoadingComponent from './components/LoadingComponent.tsx';
import { useTheme } from './contexts/ThemeContext';
import router, { prefetchRouteModules } from './routes/Routes';
import getTheme from './theme';

function App() {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  useEffect(() => {
    prefetchRouteModules();
  }, []);

  return (
    <MUIThemeProvider theme={theme}>
      <AppToaster />
      <GlobalLoader />
      <Suspense fallback={<LoadingComponent />}>
        <RouterProvider router={router} />
      </Suspense>
    </MUIThemeProvider>
  );
}

export default App;
