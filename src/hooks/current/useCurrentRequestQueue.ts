import { useNavigate } from '@tanstack/react-router';

import { Route as Home } from '@/pages/index';
import type { RequestQueue } from '@/types/extension';
import { closePopupWindow } from '@/utils/view/controlView';
import { isSidePanelView } from '@/utils/view/sidepanel';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

export function useCurrentRequestQueue() {
  const { requestQueue, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const navigate = useNavigate();

  const currentRequestQueue = requestQueue.length > 0 ? requestQueue[0] : null;

  const deQueue = async (path?: string) => {
    const newQueues = requestQueue.slice(1);

    await updateExtensionStorageStore('requestQueue', newQueues);

    if (newQueues.length === 0) {
      if (isSidePanelView()) {
        navigate({ to: path ?? Home.to });
        return;
      } else {
        await closePopupWindow();
      }

      if (path) {
        navigate({
          to: path,
        });
      }
    }

    return requestQueue.length > 0 ? requestQueue[0] : null;
  };

  const enQueue = async (queue: RequestQueue) => {
    await updateExtensionStorageStore('requestQueue', [...requestQueue, queue]);
  };
  return {
    currentRequestQueue,
    deQueue,
    enQueue,
  };
}
