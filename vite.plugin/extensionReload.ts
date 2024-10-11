import type { PluginOption } from 'vite';
import { WebSocketServer } from 'ws';

export default function extensionReloadPlugin(mode: string, port: number): PluginOption {
  let startFlag = true;
  return {
    name: 'extension-reload',
    buildStart() {
      if (mode === 'development') {
        if (WebSocketSingleton.getInstance(port) && startFlag) {
          this.info(`WebSocket::buildStart::port:${port}`);
        }
      }
    },
    closeBundle() {
      if (!startFlag) {
        this.info('WebSocket::closeBundle::requestReload');
        WebSocketSingleton.requestReload();
      } else {
        startFlag = false;
      }
    },
  };
}

class WebSocketSingleton {
  private static instance: WebSocketServer | null = null;

  public static getInstance(port: number): WebSocketServer {
    if (!this.instance) {
      this.instance = new WebSocketServer({ port });
    }
    return this.instance;
  }

  public static requestReload() {
    if (this.instance) {
      this.instance.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ type: 'reload-popup' }));
        }
      });
    }
  }
}
