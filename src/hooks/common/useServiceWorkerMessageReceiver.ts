/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';

import { extension } from '@/utils/browser';
import { isSidePanelView } from '@/utils/view/sidepanel';

import { useRefreshAccountAllAssets } from '../useRefreshAccountAllAssets';

export function useServiceWorkerMessageReceiver() {
  const { refreshAssets } = useRefreshAccountAllAssets();

  useEffect(() => {
    const handler = (request: any, _: any, sendResponse: (response?: any) => void) => {
      if (request.type === 'sidePanelState') {
        try {
          const enabled = isSidePanelView();
          sendResponse({ type: request.type, message: { enabled } });
        } catch {
          sendResponse({ type: request.type, message: { enabled: false } });
        }
        return false;
      }

      if (request.type === 'updateAssets') {
        refreshAssets();
        sendResponse({ type: request.type, message: { success: true } });
        return true;
      }
      return false;
    };

    extension.runtime.onMessage.addListener(handler);

    return () => {
      extension.runtime.onMessage.removeListener(handler);
    };
  }, [refreshAssets]);
}
