import { useEffect } from 'react';
import { browser } from 'wxt/browser';
import { type Browser } from 'wxt/browser';

import { isSidePanelView } from '@/utils/view/sidepanel';

export function useServiceWorkerMessageReceiver() {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMessage = (request: any, _: Browser.runtime.MessageSender, sendResponse: (response?: any) => void) => {
      if (!request?.type) return false;

      if (request.type === 'sidePanelState') {
        const isEnabled = isSidePanelView();

        sendResponse({ type: request.type, message: { enabled: isEnabled } });

        return false;
      }

      return false;
    };

    browser.runtime.onMessage.addListener(handleMessage);

    return () => {
      browser.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);
}
