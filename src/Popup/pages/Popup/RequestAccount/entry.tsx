import { useEffect } from 'react';

import { CHAINS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';

export default function Entry() {
  const { currentQueue, deQueue } = useCurrentQueue();
  const { chromeStorage } = useChromeStorage();
  const { currentPassword } = useCurrentPassword();
  const { currentAccount } = useCurrentAccount();

  const { additionalChains } = chromeStorage;

  useEffect(() => {
    if (currentQueue?.message.method === 'ten_requestAccount' && currentPassword) {
      const { message, messageId, origin } = currentQueue;

      const allChains = [...CHAINS, ...additionalChains];

      const chain = allChains.find((item) => item.chainName === message.params.chainName);

      if (chain) {
        const keyPair = getKeyPair(currentAccount, chain, currentPassword);
        const address = getAddress(chain, keyPair?.publicKey);

        const publicKey = keyPair?.publicKey.toString('hex');

        responseToWeb({
          response: {
            result: { address, publicKey },
          },
          message,
          messageId,
          origin,
        });

        void deQueue();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
