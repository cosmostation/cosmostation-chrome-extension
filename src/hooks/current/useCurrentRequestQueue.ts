import { useCallback, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { Route as Home } from '@/pages/index';
import type { RequestQueue } from '@/types/extension';
import { setExtensionLocalStorage } from '@/utils/storage';
import { closePopupWindow } from '@/utils/view/controlView';
import { isSidePanelView } from '@/utils/view/sidepanel';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

export function useCurrentRequestQueue() {
  const requestQueue = useExtensionStorageStore((state) => state.requestQueue);
  const updateExtensionStorageStore = useExtensionStorageStore((state) => state.updateExtensionStorageStore);

  const navigate = useNavigate();

  const currentRequestQueue = useMemo(() => (requestQueue.length > 0 ? requestQueue[0] : null), [requestQueue]);

  const deQueue = useCallback(
    async (path?: string) => {
      const newQueues = requestQueue.slice(1);
      const isQueueEmpty = newQueues.length === 0;
      const isSidePanel = isSidePanelView();

      await setExtensionLocalStorage('requestQueue', newQueues);

      if (isQueueEmpty) {
        const shouldNavigate = isSidePanel || path;

        if (shouldNavigate) {
          const destination = path || Home.to;

          await navigate({ to: destination });
        } else {
          await closePopupWindow();
        }
      }

      return newQueues.length > 0 ? newQueues[0] : null;
    },
    [navigate, requestQueue],
  );

  const enQueue = useCallback(
    async (queue: RequestQueue) => {
      await updateExtensionStorageStore('requestQueue', [...requestQueue, queue]);
    },
    [requestQueue, updateExtensionStorageStore],
  );

  return {
    requestQueue,
    currentRequestQueue,
    deQueue,
    enQueue,
  };
}
