import { useNavigate } from '@tanstack/react-router';

// import { Route as Home } from '@/pages/index';
import type { RequestQueue } from '@/types/extension';
import { closePopupWindow, closeSidePanel } from '@/utils/view/controlView';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

export function useCurrentRequestQueue() {
  const { requestQueue, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const navigate = useNavigate();

  const currentRequestQueue = requestQueue.length > 0 ? requestQueue[0] : null;

  const deQueue = async (path?: string) => {
    const newQueues = requestQueue.slice(1);

    await updateExtensionStorageStore('requestQueue', newQueues);

    if (newQueues.length === 0) {
      const isSidePanelDefault = (await chrome.sidePanel.getPanelBehavior()).openPanelOnActionClick;

      // FIXME 요청이 완료된 이후 비교적 창이 느리게 내려가는 감이 있음.
      if (isSidePanelDefault) {
        await closeSidePanel();
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
