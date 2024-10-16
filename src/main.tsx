import '@/lang/i18n';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { createHashHistory, createRouter, RouterProvider } from '@tanstack/react-router';

import { theme } from '@/styles/theme';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

import '@/styles/normalize.css';

const hashHistorhy = createHashHistory();
// Create a new router instance
const router = createRouter({ routeTree, history: hashHistorhy });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Reload the popup when rebuilding in development
if (__APP_MODE__ === 'development') {
  const socket = new WebSocket(`ws://localhost:${__APP_DEV_WEBSOCKET_PORT__}`);

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'reload-popup') {
      location.reload();
    }
  };
}

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ThemeProvider theme={theme} defaultMode="dark">
        <RouterProvider router={router} />
      </ThemeProvider>
    </StrictMode>,
  );
}
