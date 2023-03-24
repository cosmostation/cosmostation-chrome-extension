import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { closeWindow } from '~/Popup/utils/chromeWindows';
import type { Queue } from '~/types/chromeStorage';

export function useCurrentQueue() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { navigate, navigateBack } = useNavigate();

  const { queues } = chromeStorage;

  const currentQueue = queues.length > 0 ? queues[0] : null;

  const deQueue = async () => {
    const newQueues = queues.slice(1);

    await setChromeStorage('queues', newQueues);

    if (newQueues.length === 0) {
      await closeWindow(currentQueue?.windowId);
      navigate('/');
    }

    return queues.length > 0 ? queues[0] : null;
  };

  const backDeQueue = async () => {
    const newQueues = queues.slice(1);

    await setChromeStorage('queues', newQueues);

    if (newQueues.length === 0) {
      await closeWindow(currentQueue?.windowId);
      navigateBack();
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
    backDeQueue,
  };
}
