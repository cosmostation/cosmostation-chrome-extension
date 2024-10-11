import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

if (__APP_MODE__ === 'development') {
  const socket = new WebSocket(`ws://localhost:${__APP_DEV_WEBSOCKET_PORT__}`);

  socket.onopen = () => {
    console.log('WebSocket connection established');
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'reload-popup') {
      location.reload();
    }
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed');
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
