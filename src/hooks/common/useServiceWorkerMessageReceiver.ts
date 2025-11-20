import { useEffect } from 'react';

import { extension } from '@/utils/browser';
import { isSidePanelView } from '@/utils/view/sidepanel';

export function useServiceWorkerMessageReceiver() {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMessage = (request: any, _: chrome.runtime.MessageSender | browser.runtime.MessageSender, sendResponse: (response?: any) => void) => {
      if (!request?.type) return false;

      if (request.type === 'sidePanelState') {
        const isEnabled = isSidePanelView();

        sendResponse({ type: request.type, message: { enabled: isEnabled } });

        return false;
      }

      return false;
    };

    extension.runtime.onMessage.addListener(handleMessage);

    return () => {
      extension.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);
}
