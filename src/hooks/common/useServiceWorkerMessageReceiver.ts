/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { browser } from 'wxt/browser';
import { type Browser } from 'wxt/browser';

import { isSidePanelView } from '@/utils/view/sidepanel';

import { useRefreshAccountAllAssets } from '../useRefreshAccountAllAssets';

export function useServiceWorkerMessageReceiver() {
  const { refreshAssets } = useRefreshAccountAllAssets();

  useEffect(() => {
    const handler = (request: any, _: Browser.runtime.MessageSender, sendResponse: (response?: any) => void) => {
      if (request.type === 'sidePanelState') {
        try {
          const enabled = isSidePanelView();
          sendResponse({ type: request.type, message: { enabled } });
        } catch {
          sendResponse({ type: request.type, message: { enabled: false } });
        }
      }

      if (request.type === 'updateAssets') {
        refreshAssets();
      }
    };

    browser.runtime.onMessage.addListener(handler);

    return () => {
      browser.runtime.onMessage.removeListener(handler);
    };
  }, [refreshAssets]);
}
