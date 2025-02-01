import { useEffect } from 'react';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getAddress, getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import type { CosmosChain } from '@/types/chain';
import type { ResponseAppMessage } from '@/types/message/content';
import type { CosRequestAccount, CosRequestAccountResponse } from '@/types/message/inject/cosmos';

export default function Entry() {
  const { currentRequestQueue, deQueue } = useCurrentRequestQueue();
  const { chainList } = useChainList();

  const { currentPassword } = useCurrentPassword();
  const { currentAccount } = useCurrentAccount();

  useEffect(() => {
    const handleRequestAccount = async () => {
      try {
        // FIXME 락걸린 상태에서 + 오리진 없는 경우에서 계정 연결 요청 완료 후 팝업 내리는 시간이 오래걸림.
        if (currentRequestQueue?.method === 'cos_requestAccount' && currentPassword) {
          const { tabId, requestId, origin, params } = currentRequestQueue;

          const allCosmosChains = [...(chainList.cosmosChains || []), ...chainList.customCosmosChains];

          const selectedChain = allCosmosChains.filter((item) => item.chainId === params?.chainName);

          const chainName = selectedChain.length === 1 ? selectedChain[0].name.toLowerCase() : params?.chainName?.toLowerCase();

          const chain = allCosmosChains.find((item) => item.name.toLowerCase() === chainName) as CosmosChain | undefined;

          if (chain) {
            const keyPair = getKeypair(chain, currentAccount, currentPassword);
            const address = getAddress(chain, keyPair.publicKey);

            const publicKey = keyPair.publicKey;

            const result: CosRequestAccountResponse = {
              address,
              publicKey,
              name: currentAccount.name,
              isLedger: false,
              isEthermint: chain.isEvm,
            };

            sendMessage<ResponseAppMessage<CosRequestAccount>>({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                result,
              },
            });

            void deQueue();
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    handleRequestAccount();

    // if ((currentQueue?.message.method === 'eth_requestAccounts' || currentQueue?.message.method === 'wallet_requestPermissions') && currentPassword) {
    //   const { message, messageId, origin } = currentQueue;
    //   const chain = ETHEREUM;

    //   const keyPair = getKeyPair(currentAccount, chain, currentPassword);
    //   const address = getAddress(chain, keyPair?.publicKey);

    //   const result: EthRequestAccountsResponse = [address];

    //   responseToWeb({
    //     response: {
    //       result,
    //     },
    //     message,
    //     messageId,
    //     origin,
    //   });

    //   void deQueue();
    // }

    // if ((currentQueue?.message.method === 'aptos_account' || currentQueue?.message.method === 'aptos_connect') && currentPassword) {
    //   const { message, messageId, origin } = currentQueue;
    //   const chain = APTOS;

    //   const keyPair = getKeyPair(currentAccount, chain, currentPassword);
    //   const address = getAddress(chain, keyPair?.publicKey);

    //   const result: AptosAccountResponse = { address, publicKey: `0x${keyPair!.publicKey.toString('hex')}` };

    //   responseToWeb({
    //     response: {
    //       result,
    //     },
    //     message,
    //     messageId,
    //     origin,
    //   });

    //   void deQueue();
    // }

    // if (currentQueue?.message.method === 'sui_connect') {
    //   const { message, messageId, origin } = currentQueue;

    //   const result: SuiConnectResponse = null;

    //   responseToWeb({
    //     response: {
    //       result,
    //     },
    //     message,
    //     messageId,
    //     origin,
    //   });

    //   void deQueue();
    // }

    // if (currentQueue?.message.method === 'sui_getAccount' && currentPassword) {
    //   const chain = SUI;

    //   const { message, messageId, origin } = currentQueue;

    //   const keyPair = getKeyPair(currentAccount, chain, currentPassword);
    //   const address = getAddress(chain, keyPair?.publicKey);

    //   const publicKey = `0x${keyPair!.publicKey.toString('hex')}`;

    //   const result: SuiGetAccountResponse = {
    //     address,
    //     publicKey,
    //   };

    //   responseToWeb({
    //     response: {
    //       result,
    //     },
    //     message,
    //     messageId,
    //     origin,
    //   });

    //   void deQueue();
    // }

    // if (currentQueue?.message.method === 'bit_requestAccount' && currentPassword) {
    //   const { message, messageId, origin } = currentQueue;

    //   const chain = BITCOIN;

    //   if (chain) {
    //     const keyPair = getKeyPair(currentAccount, chain, currentPassword);
    //     const address = getAddress(chain, keyPair?.publicKey);

    //     const result: BitRequestAccountResponse = [address];

    //     responseToWeb({
    //       response: {
    //         result,
    //       },
    //       message,
    //       messageId,
    //       origin,
    //     });

    //     void deQueue();
    //   }
    // }
  }, [chainList.cosmosChains, chainList.customCosmosChains, currentAccount, currentPassword, currentRequestQueue, deQueue]);
  return null;
}
