import { debounce } from 'lodash';

import { sendMessage } from '@/libs/extension';
import type { RequestQueue } from '@/types/extension';

import { getExtensionLocalStorage, setExtensionLocalStorage } from './storage';
import { openPopupWindow } from './view/controlView';

let localQueues: RequestQueue[] = [];

export const setQueues = debounce(
  async () => {
    const queues = localQueues;
    localQueues = [];

    const currentRequestQueue = await getExtensionLocalStorage('requestQueue');

    const isSidePanelDefault = (await chrome.sidePanel.getPanelBehavior()).openPanelOnActionClick;

    const lastQueueItem = queues[queues.length - 1];
    if (isSidePanelDefault) {
      sendMessage({
        target: 'CONTENT',
        method: 'openSidePanel',
        origin: lastQueueItem.origin,
        requestId: lastQueueItem.requestId,
        tabId: lastQueueItem.tabId,
        params: {
          id: lastQueueItem.id,
        },
      });
    } else {
      await openPopupWindow();
    }

    await setExtensionLocalStorage('requestQueue', [...currentRequestQueue.map((item) => ({ ...item })), ...queues.map((item) => ({ ...item }))]);
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
