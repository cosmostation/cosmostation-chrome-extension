import { useEffect } from 'react';

import { CHAINS } from '~/constants/chain';
import { APTOS } from '~/constants/chain/aptos/aptos';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { responseToWeb } from '~/Popup/utils/message';
import type { CosmosChain } from '~/types/chain';
import type { AptosAccountResponse } from '~/types/message/aptos';
import type { CosRequestAccountResponse } from '~/types/message/cosmos';
import type { EthRequestAccountsResponse } from '~/types/message/ethereum';

export default function Entry() {
  const { currentQueue, deQueue } = useCurrentQueue();
  const { chromeStorage } = useChromeStorage();
  const { currentPassword } = useCurrentPassword();
  const { currentAccount } = useCurrentAccount();

  const { additionalChains } = chromeStorage;

  useEffect(() => {
    if ((currentQueue?.message.method === 'cos_requestAccount' || currentQueue?.message.method === 'ten_requestAccount') && currentPassword) {
      const { message, messageId, origin } = currentQueue;

      const allChains = [...CHAINS, ...additionalChains];

      const chain = allChains.find((item) => item.chainName === message.params.chainName) as CosmosChain | undefined;

      if (chain) {
        const keyPair = getKeyPair(currentAccount, chain, currentPassword);
        const address = getAddress(chain, keyPair?.publicKey);

        const publicKey = keyPair?.publicKey.toString('hex');

        const result: CosRequestAccountResponse = {
          address,
          publicKey: publicKey as unknown as Uint8Array,
          name: currentAccount.name,
          isLedger: currentAccount.type === 'LEDGER',
          isEthermint: chain.type === 'ETHERMINT',
        };

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

    if ((currentQueue?.message.method === 'eth_requestAccounts' || currentQueue?.message.method === 'wallet_requestPermissions') && currentPassword) {
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

    if ((currentQueue?.message.method === 'aptos_account' || currentQueue?.message.method === 'aptos_connect') && currentPassword) {
      const { message, messageId, origin } = currentQueue;
      const chain = APTOS;

      const keyPair = getKeyPair(currentAccount, chain, currentPassword);
      const address = getAddress(chain, keyPair?.publicKey);

      const result: AptosAccountResponse = { address, publicKey: `0x${keyPair!.publicKey.toString('hex')}` };

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
