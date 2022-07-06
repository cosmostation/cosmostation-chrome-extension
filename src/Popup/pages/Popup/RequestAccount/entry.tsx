import { useEffect } from 'react';

import { CHAINS } from '~/constants/chain';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';
import type { TenRequestAccountResponse } from '~/types/cosmos/message';
import type { EthRequestAccountsResponse } from '~/types/ethereum/message';

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

        const result: TenRequestAccountResponse = { address, publicKey: publicKey as unknown as Uint8Array, name: currentAccount.name };

        responseToWeb({
          response: {
            result,
          },
          message,
          messageId,
          origin,
        });

        void deQueue();
      }
    }

    if (currentQueue?.message.method === 'eth_requestAccounts' && currentPassword) {
      const { message, messageId, origin } = currentQueue;
      const chain = ETHEREUM;

      const keyPair = getKeyPair(currentAccount, chain, currentPassword);
      const address = getAddress(chain, keyPair?.publicKey);

      const result: EthRequestAccountsResponse = [address];

      responseToWeb({
        response: {
          result,
        },
        message,
        messageId,
        origin,
      });

      void deQueue();
    }
  }, [additionalChains, currentAccount, currentPassword, currentQueue, deQueue]);
  return null;
}
