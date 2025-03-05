import { useEffect } from 'react';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getAddress, getKeypair } from '@/libs/address';
import { getChains } from '@/libs/chain';
import { sendMessage } from '@/libs/extension';
import type { CosmosChain } from '@/types/chain';
import type { ResponseAppMessage } from '@/types/message/content';
import type { CosRequestAccount, CosRequestAccountResponse } from '@/types/message/inject/cosmos';
import type { EthRequestAccounts, EthRequestAccountsResponse } from '@/types/message/inject/evm';
import type { SuiRequestAccount, SuiRequestAccountResponse, SuiRequestConnect, SuiRequestConnectResponse } from '@/types/message/inject/sui';
import { EthereumRPCError, SuiRPCError } from '@/utils/error';
import { addHexPrefix } from '@/utils/string';

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
          const { tabId, requestId, origin, params, id } = currentRequestQueue;

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
                id,
                result,
              },
            });

            void deQueue();
          }
        }

        if ((currentRequestQueue?.method === 'eth_requestAccounts' || currentRequestQueue?.method === 'wallet_requestPermissions') && currentPassword) {
          const { tabId, requestId, origin, id } = currentRequestQueue;
          const evmChains = (await getChains()).evmChains;
          const evmChain = evmChains?.find((item) => item.chainId === '0x1') || evmChains?.[0];

          if (evmChain) {
            const keyPair = getKeypair(evmChain, currentAccount, currentPassword);
            const address = getAddress(evmChain, keyPair.publicKey);

            const result: EthRequestAccountsResponse = [address];

            sendMessage<ResponseAppMessage<EthRequestAccounts>>({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id,
                result,
              },
            });

            void deQueue();
          } else {
            sendMessage<ResponseAppMessage<EthRequestAccounts>>({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id,
                error: new EthereumRPCError(RPC_ERROR.INVALID_REQUEST, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_REQUEST]),
              },
            });

            void deQueue();
          }
        }

        if (currentRequestQueue?.method === 'sui_connect') {
          const { tabId, requestId, origin, id } = currentRequestQueue;

          const result: SuiRequestConnectResponse = null;

          sendMessage<ResponseAppMessage<SuiRequestConnect>>({
            target: 'CONTENT',
            method: 'responseApp',
            origin,
            requestId,
            tabId,
            params: {
              id,
              result,
            },
          });
          void deQueue();
        }

        if (currentRequestQueue?.method === 'sui_getAccount' && currentPassword) {
          const { tabId, requestId, origin, id } = currentRequestQueue;
          const suiChains = (await getChains()).suiChains;
          const suiChain = suiChains?.find((item) => item.id === 'sui') || suiChains?.[0];

          if (suiChain) {
            const keyPair = getKeypair(suiChain, currentAccount, currentPassword);
            const address = getAddress(suiChain, keyPair.publicKey);

            const publicKey = addHexPrefix(keyPair!.publicKey);

            const result: SuiRequestAccountResponse = {
              address,
              publicKey,
            };

            sendMessage<ResponseAppMessage<SuiRequestAccount>>({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id,
                result,
              },
            });

            void deQueue();
          } else {
            const { tabId, requestId, origin, id } = currentRequestQueue;

            sendMessage<ResponseAppMessage<SuiRequestAccount>>({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id,
                error: new SuiRPCError(RPC_ERROR.INTERNAL, RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL], id),
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
  }, [
    chainList.cosmosChains,
    chainList.customCosmosChains,
    chainList.evmChains,
    chainList.suiChains,
    currentAccount,
    currentPassword,
    currentRequestQueue,
    deQueue,
  ]);
  return null;
}
