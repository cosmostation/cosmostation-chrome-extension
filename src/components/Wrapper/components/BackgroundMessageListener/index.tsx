/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';

import { useRefreshAccountAllAssets } from '@/hooks/useRefreshAccountAllAssets';
import { extension } from '@/utils/browser';
import { isSidePanelView } from '@/utils/view/sidepanel';

type BackgroundMessageListenerProps = {
  children: JSX.Element;
};

export default function BackgroundMessageListener({ children }: BackgroundMessageListenerProps) {
  const { refreshAssets } = useRefreshAccountAllAssets();

  useEffect(() => {
    const handler = (request: any, _: any, sendResponse: (response?: any) => void) => {
      if (request.type === 'sidePanelState') {
        if (isSidePanelView()) {
          try {
            sendResponse({ type: request.type, message: { enabled: true } });
          } catch {
            sendResponse({ type: request.type, message: { enabled: false } });
          }
        } else {
          sendResponse({ type: request.type, message: { enabled: false } });
        }
      }

      if (request.type === 'updateAssets') {
        refreshAssets();
        sendResponse({ type: request.type, message: { success: true } });
      }
    };

    extension.runtime.onMessage.addListener(handler);
    return () => {
      extension.runtime.onMessage.removeListener(handler);
    };
  }, [refreshAssets]);

  return <>{children}</>;
}
