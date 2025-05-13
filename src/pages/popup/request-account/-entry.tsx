import { useEffect } from 'react';
import { produce } from 'immer';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { useCurrentPreferAccountTypes } from '@/hooks/useCurrentPreferAccountTypes';
import { getAddress, getKeypair } from '@/libs/address';
import { getChains } from '@/libs/chain';
import { sendMessage } from '@/libs/extension';
import type { CosmosChain } from '@/types/chain';
import type { ResponseAppMessage } from '@/types/message/content';
import type { AptosAccount } from '@/types/message/inject/aptos';
import type { BitRequestAccount } from '@/types/message/inject/bitcoin';
import type { CosRequestAccount, CosRequestAccountResponse, CosRequestAccountsSettled, CosRequestAccountsSettledResponse } from '@/types/message/inject/cosmos';
import type { EthRequestAccounts, EthRequestAccountsResponse } from '@/types/message/inject/evm';
import type { IotaRequestAccount, IotaRequestAccountResponse, IotaRequestConnect, IotaRequestConnectResponse } from '@/types/message/inject/iota';
import type { SuiRequestAccount, SuiRequestAccountResponse, SuiRequestConnect, SuiRequestConnectResponse } from '@/types/message/inject/sui';
import { CosmosRPCError, EthereumRPCError, IotaRPCError, SuiRPCError } from '@/utils/error';
import { extensionLocalStorage, getExtensionLocalStorage } from '@/utils/storage';
import { addHexPrefix } from '@/utils/string';

export default function Entry() {
  const { currentRequestQueue, deQueue } = useCurrentRequestQueue();
  const { currentPreferAccountType } = useCurrentPreferAccountTypes();
  const { chainList } = useChainList();

  const { currentPassword } = useCurrentPassword();
  const { currentAccount, refreshOriginConnectionTime } = useCurrentAccount();

  useEffect(() => {
    const handleRequestAccount = async () => {
      const currentAccountAddressInfo = await getExtensionLocalStorage(`${currentAccount.id}-address`);

      try {
        if (currentRequestQueue?.method === 'cos_requestAccount' && currentPassword) {
          const { tabId, requestId, origin, params } = currentRequestQueue;

          const allCosmosChains = chainList?.allCosmosChains || [];

          const selectedChain = allCosmosChains.filter((item) => item.chainId === params?.chainName);

          const chainName = selectedChain.length === 1 ? selectedChain[0].name.toLowerCase() : params?.chainName?.toLowerCase();

          const chain = allCosmosChains.find((item) => item.name.toLowerCase() === chainName) as CosmosChain | undefined;

          if (chain) {
            const inAppSelectedPreferAccountType = currentPreferAccountType?.[chain.id];

            const updatedChain = inAppSelectedPreferAccountType
              ? produce(chain, (draft) => {
                  draft.accountTypes = draft.accountTypes.filter(
                    (item) => item.pubkeyStyle === inAppSelectedPreferAccountType?.pubkeyStyle && item.hdPath === inAppSelectedPreferAccountType?.hdPath,
                  );
                })
              : chain;

            void refreshOriginConnectionTime(origin);

            const keyPair = getKeypair(updatedChain, currentAccount, currentPassword);
            const address = getAddress(updatedChain, keyPair.publicKey);

            const publicKey = keyPair.publicKey;
            const isEthermint = updatedChain.accountTypes[0].pubkeyStyle === 'keccak256';

            const result: CosRequestAccountResponse = {
              address,
              publicKey,
              name: currentAccount.name,
              isLedger: false,
              isEthermint,
            };

            sendMessage<ResponseAppMessage<CosRequestAccount>>({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id: requestId,
                result,
              },
            });

            void deQueue();
          }
        }

        if (currentRequestQueue?.method === 'cos_requestAccountsSettled' && currentPassword) {
          const { tabId, requestId, origin, params } = currentRequestQueue;

          const inputChainIds = params.chainIds;

          if (chainList.cosmosChains && chainList.cosmosChains?.length > 0) {
            const allCosmosChains = chainList.allCosmosChains;

            const result: CosRequestAccountsSettledResponse = inputChainIds.map((inputChainId) => {
              const targetChain = allCosmosChains.find((chain) => chain.chainId === inputChainId);

              if (!targetChain) {
                return {
                  status: 'rejected',
                  reason: new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]),
                };
              }

              const inAppSelectedPreferAccountType = currentPreferAccountType?.[targetChain?.id];

              const updatedChain = inAppSelectedPreferAccountType
                ? produce(targetChain, (draft) => {
                    draft.accountTypes = draft.accountTypes.filter(
                      (item) => item.pubkeyStyle === inAppSelectedPreferAccountType?.pubkeyStyle && item.hdPath === inAppSelectedPreferAccountType?.hdPath,
                    );
                  })
                : targetChain;

              const matchedAddressInfo = currentAccountAddressInfo.find(
                (info) => info.chainId === updatedChain.id && info.chainType === 'cosmos' && info.accountType.hdPath === updatedChain.accountTypes[0].hdPath,
              );

              if (matchedAddressInfo) {
                const isEthermint = matchedAddressInfo.accountType.pubkeyStyle === 'keccak256';
                return {
                  status: 'fulfilled',
                  value: {
                    chainId: inputChainId,
                    address: matchedAddressInfo.address,
                    publicKey: matchedAddressInfo.publicKey,
                    name: currentAccount.name,
                    isLedger: false,
                    isEthermint,
                  },
                };
              } else {
                const keyPair = getKeypair(updatedChain, currentAccount, currentPassword);
                const address = getAddress(updatedChain, keyPair?.publicKey);
                const publicKey = keyPair?.publicKey || '';
                const isEthermint = updatedChain.accountTypes[0].pubkeyStyle === 'keccak256';

                return {
                  status: 'fulfilled',
                  value: {
                    chainId: inputChainId,
                    address,
                    publicKey,
                    name: currentAccount.name,
                    isLedger: false,
                    isEthermint,
                  },
                };
              }
            });

            void refreshOriginConnectionTime(origin);

            sendMessage<ResponseAppMessage<CosRequestAccountsSettled>>({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id: requestId,
                result,
              },
            });

            void deQueue();
          }
        }

        if ((currentRequestQueue?.method === 'eth_requestAccounts' || currentRequestQueue?.method === 'wallet_requestPermissions') && currentPassword) {
          const { tabId, requestId, origin } = currentRequestQueue;
          const evmChains = (await getChains()).evmChains;
          const evmChain = evmChains?.find((item) => item.chainId === '0x1') || evmChains?.[0];

          if (evmChain) {
            void refreshOriginConnectionTime(origin);

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
                id: requestId,
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
                id: requestId,
                error: new EthereumRPCError(RPC_ERROR.INVALID_REQUEST, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_REQUEST]),
              },
            });

            void deQueue();
          }
        }

        if (currentRequestQueue?.method === 'sui_connect') {
          const { tabId, requestId, origin } = currentRequestQueue;

          const result: SuiRequestConnectResponse = null;

          void refreshOriginConnectionTime(origin);

          sendMessage<ResponseAppMessage<SuiRequestConnect>>({
            target: 'CONTENT',
            method: 'responseApp',
            origin,
            requestId,
            tabId,
            params: {
              id: requestId,
              result,
            },
          });
          void deQueue();
        }

        if (currentRequestQueue?.method === 'sui_getAccount' && currentPassword) {
          const { tabId, requestId, origin } = currentRequestQueue;
          const suiChains = (await getChains()).suiChains;
          const suiChain = suiChains?.find((item) => item.id === 'sui') || suiChains?.[0];

          if (suiChain) {
            void refreshOriginConnectionTime(origin);

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
                id: requestId,
                result,
              },
            });

            void deQueue();
          } else {
            const { tabId, requestId, origin } = currentRequestQueue;

            sendMessage<ResponseAppMessage<SuiRequestAccount>>({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id: requestId,
                error: new SuiRPCError(RPC_ERROR.INTERNAL, RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL], requestId),
              },
            });

            void deQueue();
          }
        }

        if (currentRequestQueue?.method === 'bit_requestAccount' && currentPassword) {
          const { tabId, requestId, origin } = currentRequestQueue;

          const { currentBitcoinNetwork } = await extensionLocalStorage();

          if (currentBitcoinNetwork) {
            void refreshOriginConnectionTime(origin);

            const keyPair = getKeypair(currentBitcoinNetwork, currentAccount, currentPassword);
            const address = getAddress(currentBitcoinNetwork, keyPair?.publicKey);

            const result = [address];

            sendMessage<ResponseAppMessage<BitRequestAccount>>({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id: requestId,
                result,
              },
            });

            void deQueue();
          }
        }

        if ((currentRequestQueue?.method === 'aptos_account' || currentRequestQueue?.method === 'aptos_connect') && currentPassword) {
          const { tabId, requestId, origin } = currentRequestQueue;

          const { currentAptosNetwork } = await extensionLocalStorage();

          if (currentAptosNetwork) {
            void refreshOriginConnectionTime(origin);

            const keyPair = getKeypair(currentAptosNetwork, currentAccount, currentPassword);
            const address = getAddress(currentAptosNetwork, keyPair?.publicKey);

            const result = { address, publicKey: `0x${keyPair!.publicKey}` };

            sendMessage<ResponseAppMessage<AptosAccount>>({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id: requestId,
                result,
              },
            });

            void deQueue();
          }
        }

        if (currentRequestQueue?.method === 'iota_connect') {
          const { tabId, requestId, origin } = currentRequestQueue;

          const result: IotaRequestConnectResponse = null;

          void refreshOriginConnectionTime(origin);

          sendMessage<ResponseAppMessage<IotaRequestConnect>>({
            target: 'CONTENT',
            method: 'responseApp',
            origin,
            requestId,
            tabId,
            params: {
              id: requestId,
              result,
            },
          });
          void deQueue();
        }

        if (currentRequestQueue?.method === 'iota_getAccount' && currentPassword) {
          const { tabId, requestId, origin } = currentRequestQueue;
          const iotaChains = (await getChains()).iotaChains;
          const iotaChain = iotaChains?.find((item) => item.id === 'iota') || iotaChains?.[0];

          if (iotaChain) {
            void refreshOriginConnectionTime(origin);

            const keyPair = getKeypair(iotaChain, currentAccount, currentPassword);
            const address = getAddress(iotaChain, keyPair.publicKey);

            const publicKey = addHexPrefix(keyPair!.publicKey);

            const result: IotaRequestAccountResponse = {
              address,
              publicKey,
            };

            sendMessage<ResponseAppMessage<IotaRequestAccount>>({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id: requestId,
                result,
              },
            });

            void deQueue();
          } else {
            const { tabId, requestId, origin } = currentRequestQueue;

            sendMessage<ResponseAppMessage<IotaRequestAccount>>({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id: requestId,
                error: new IotaRPCError(RPC_ERROR.INTERNAL, RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL], requestId),
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
  }, [chainList?.allCosmosChains, currentAccount, currentPassword, currentPreferAccountType, currentRequestQueue, deQueue, refreshOriginConnectionTime]);
  return null;
}
