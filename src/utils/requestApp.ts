import { debounce } from 'lodash';

// import { sendMessage } from '@/libs/extension';
import type { RequestQueue } from '@/types/extension';

import { getExtensionLocalStorage, setExtensionLocalStorage } from './storage';
import { openPopupWindow } from './view/controlView';

let localQueues: RequestQueue[] = [];

export const setQueues = debounce(
  async () => {
    const queues = localQueues;
    localQueues = [];

    const currentRequestQueue = await getExtensionLocalStorage('requestQueue');

    // FIXME 사이드패널 사인요청 팝업 오픈안되는 이슈 해결전까지 주석처리
    // const isSidePanelDefault = (await chrome.sidePanel.getPanelBehavior()).openPanelOnActionClick;

    // const lastQueueItem = queues[queues.length - 1];
    // if (isSidePanelDefault) {
    //   await sendMessage({
    //     target: 'CONTENT',
    //     method: 'openSidePanel',
    //     origin: lastQueueItem.origin,
    //     requestId: lastQueueItem.requestId,
    //     tabId: lastQueueItem.tabId,
    //     params: {
    //       id: lastQueueItem.id,
    //     },
    //   });
    //   await setExtensionLocalStorage('requestQueue', [...currentRequestQueue.map((item) => ({ ...item })), ...queues.map((item) => ({ ...item }))]);
    // } else {

    // }

    const window = await openPopupWindow();

    await setExtensionLocalStorage('requestQueue', [
      ...currentRequestQueue.map((item) => ({ ...item, windowId: window?.id })),
      ...queues.map((item) => ({ ...item, windowId: window?.id })),
    ]);
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
