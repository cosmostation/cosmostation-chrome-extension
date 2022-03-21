import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';

export function useCurrentQueue() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { queues } = chromeStorage;

  const currentQueue = queues.length > 0 ? queues[0] : null;

  const deQueue = async () => {
    const newQueues = queues.slice(1);

    await setChromeStorage('queues', newQueues);

    return queues.length > 0 ? queues[0] : null;
  };
  return {
    currentQueue,
    deQueue,
  };
}
