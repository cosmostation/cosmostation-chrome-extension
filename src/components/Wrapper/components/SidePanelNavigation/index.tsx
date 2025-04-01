import { useEffect } from 'react';

import { extension } from '@/utils/browser';
import { isSidePanelView } from '@/utils/view/sidepanel';

type SidePanelStateObserverProps = {
  children: JSX.Element;
};

export default function SidePanelStateObserver({ children }: SidePanelStateObserverProps) {
  useEffect(() => {
    extension.runtime.onMessage.addListener((request, _, sendResponse) => {
      if (!request?.type) return true;

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

      return true;
    });
  }, []);

  return <>{children}</>;
}
