import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashHistory, createRouter, RouterProvider } from '@tanstack/react-router';

import { routeTree } from './routeTree.gen.ts';

if (__APP_MODE__ === 'development') {
  const socket = new WebSocket(`ws://localhost:${__APP_DEV_WEBSOCKET_PORT__}`);

  // socket.onopen = () => {
  //   console.log('WebSocket connection established');
  // };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'reload-popup') {
      location.reload();
    }
  };

  // socket.onclose = () => {
  //   console.log('WebSocket connection closed');
  // };
}

const router = createRouter({
  routeTree,
  history: createHashHistory(),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
