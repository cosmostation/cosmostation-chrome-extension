import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { closeWindow } from '~/Popup/utils/chromeWindows';

export function useCurrentQueue() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { navigate } = useNavigate();

  const { queues } = chromeStorage;

  const currentQueue = queues.length > 0 ? queues[0] : null;

  const deQueue = async () => {
    const newQueues = queues.slice(1);

    await setChromeStorage('queues', newQueues);

    if (newQueues.length === 0) {
      navigate('/');
      await closeWindow();
    }

    return queues.length > 0 ? queues[0] : null;
  };
  return {
    currentQueue,
    deQueue,
  };
}
