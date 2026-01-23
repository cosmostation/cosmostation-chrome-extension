import '@/lang/i18n';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import GlobalStyles from '@mui/material/GlobalStyles';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createHashHistory, createRouter, RouterProvider } from '@tanstack/react-router';

import { theme } from '@/styles/theme';

import ToastContainer from './components/common/ToastContainer';
// Import the generated route tree
import { routeTree } from './routeTree.gen';
import { detectIsPopup } from './utils/firefox/view';

import '@/styles/normalize.css';

const hashHistorhy = createHashHistory();
// Create a new router instance
const router = createRouter({ routeTree, history: hashHistorhy });
const queryClient = new QueryClient();

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const shouldForceFixedPopupWidth = __APP_BROWSER__ === 'firefox' && detectIsPopup();

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ThemeProvider theme={theme} defaultMode="dark">
        {shouldForceFixedPopupWidth && (
          <GlobalStyles
            styles={{
              body: {
                width: '36rem',
              },
            }}
          />
        )}
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <ToastContainer />
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>,
  );
}
