import { debounce } from 'lodash';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { sendMessage } from '@/libs/extension';
import type { RequestQueue } from '@/types/extension';

import { getExtensionLocalStorage, setExtensionLocalStorage } from './storage';
import { openPopupWindow } from './view/controlView';

let localQueues: RequestQueue[] = [];

export const setQueues = debounce(
  async () => {
    const queuesBackup = [...localQueues];
    try {
      const queues = localQueues;
      localQueues = [];

      const currentRequestQueue = await getExtensionLocalStorage('requestQueue');

      let sidePanelStatusResponse;
      try {
        if (__APP_BROWSER__ === 'chrome') {
          sidePanelStatusResponse = await chrome.runtime.sendMessage({ type: 'sidePanelState' });
        } else {
          sidePanelStatusResponse = await browser.runtime.sendMessage({ type: 'sidePanelState' });
        }
      } catch (e) {
        console.error(e);
      }

      const isSidePanelActive = sidePanelStatusResponse?.type === 'sidePanelState' && sidePanelStatusResponse?.message?.enabled === true;

      if (isSidePanelActive) {
        await setExtensionLocalStorage('requestQueue', [...currentRequestQueue.map((item) => ({ ...item })), ...queues.map((item) => ({ ...item }))]);
      } else {
        const window = await openPopupWindow();
        await setExtensionLocalStorage('requestQueue', [
          ...currentRequestQueue.map((item) => ({ ...item, windowId: window?.id })),
          ...queues.map((item) => ({ ...item, windowId: window?.id })),
        ]);
      }
    } catch {
      queuesBackup.forEach((queue) =>
        sendMessage({
          target: 'CONTENT',
          method: 'responseApp',
          origin,
          requestId: queue.requestId,
          tabId: queue.tabId,
          params: {
            id: queue.requestId,
            error: {
              code: RPC_ERROR.INTERNAL,
              message: `${RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL]}`,
            },
          },
        }),
      );
    }
  },
  500,
  { leading: true },
);

export function enqueueRequest(queue: RequestQueue) {
  localQueues.push(queue);
}

export function processRequest(queue: RequestQueue) {
  enqueueRequest(queue);
  void setQueues();
}
