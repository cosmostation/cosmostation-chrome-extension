import { extension } from './browser';

export function emitToWeb(
  data: {
    event: string;
    chainType: string;
    data: unknown;
  },
  origins: string[],
) {
  origins.forEach((origin) => {
    void extension.tabs.query({ url: `${origin}/*` }, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          void extension.tabs.sendMessage(tab.id, data);
        }
      });
    });
  });
}
