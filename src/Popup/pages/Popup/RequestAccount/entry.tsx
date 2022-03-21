import { useEffect } from 'react';

import { CHAINS } from '~/constants/chain';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
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
    if (currentQueue?.message.method === 'ten_requestAccounts' && currentPassword) {
      const { message, messageId, origin } = currentQueue;

      const chain = message.params.isBeta
        ? additionalChains.find((item) => item.chainName === message.params.chainName)
        : CHAINS.find((item) => item.chainName === message.params.chainName);

      if (chain) {
        const keyPair = getKeyPair(currentAccount, chain, currentPassword);
        const address = getAddress(chain, keyPair?.publicKey);

        console.log('dddd');

        responseToWeb({
          message: {
            result: address,
          },
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
