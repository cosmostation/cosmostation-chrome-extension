import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { closeTab } from '~/Popup/utils/extensionTabs';
import { closeWindow } from '~/Popup/utils/extensionWindows';
import type { Queue } from '~/types/extensionStorage';
import type { Path } from '~/types/route';

import { useCurrentAccount } from './useCurrentAccount';

export function useCurrentQueue() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { navigate } = useNavigate();
  const { currentAccount } = useCurrentAccount();

  const { queues } = extensionStorage;

  const currentQueue = queues.length > 0 ? queues[0] : null;

  const deQueue = async (path?: Path) => {
    const newQueues = queues.slice(1);

    await setExtensionStorage('queues', newQueues);

    if (newQueues.length === 0) {
      await closeWindow(currentQueue?.windowId);

      if (currentAccount.type === 'LEDGER') {
        await closeTab();
      }

      if (path) {
        navigate(path);
      } else {
        navigate('/');
      }
    }

    return queues.length > 0 ? queues[0] : null;
  };

  const enQueue = async (queue: Queue) => {
    await setExtensionStorage('queues', [...queues, queue]);
  };
  return {
    currentQueue,
    deQueue,
    enQueue,
  };
}
