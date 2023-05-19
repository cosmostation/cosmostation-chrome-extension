import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { closeWindow } from '~/Popup/utils/chromeWindows';
import type { Queue } from '~/types/chromeStorage';
import type { Path } from '~/types/route';

export function useCurrentQueue() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { navigate } = useNavigate();

  const { queues } = chromeStorage;

  const currentQueue = queues.length > 0 ? queues[0] : null;

  const deQueue = async (path?: Path) => {
    const newQueues = queues.slice(1);

    await setChromeStorage('queues', newQueues);

    if (newQueues.length === 0) {
      await closeWindow(currentQueue?.windowId);
      if (path) {
        navigate(path);
      } else {
        navigate('/');
      }
    }

    return queues.length > 0 ? queues[0] : null;
  };

  const enQueue = async (queue: Queue) => {
    await setChromeStorage('queues', [...queues, queue]);
  };
  return {
    currentQueue,
    deQueue,
    enQueue,
  };
}
