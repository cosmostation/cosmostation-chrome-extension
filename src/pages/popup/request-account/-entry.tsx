import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { produce } from 'immer';
import type { PublicKey } from '@solana/web3.js';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import Base1300Text from '@/components/common/Base1300Text';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { EAccountStatus, RESPONSE_MESSAGE as GNO_MESSAGE, RESPONSE_STATUS as GNO_RESPONSE_STATUS } from '@/constants/gno';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { useCurrentPreferAccountTypes } from '@/hooks/useCurrentPreferAccountTypes';
import { getAddress, getKeypair } from '@/libs/address';
import { getChains } from '@/libs/chain';
import { sendMessage } from '@/libs/extension';
import type { RequestQueue } from '@/types/extension';
import type { ResponseAppMessage } from '@/types/message/content';
import type { AptosAccount } from '@/types/message/inject/aptos';
import type { BitRequestAccount } from '@/types/message/inject/bitcoin';
import type { CosRequestAccount, CosRequestAccountResponse, CosRequestAccountsSettled, CosRequestAccountsSettledResponse } from '@/types/message/inject/cosmos';
import type { EthRequestAccounts, EthRequestAccountsResponse } from '@/types/message/inject/evm';
import type { GnoConnect, GnoConnectResponse, GnoGetAccountResponse } from '@/types/message/inject/gno';
import type { IotaRequestAccount, IotaRequestAccountResponse, IotaRequestConnect, IotaRequestConnectResponse } from '@/types/message/inject/iota';
import type { SolanaConnect } from '@/types/message/inject/solana';
import type { SuiRequestAccount, SuiRequestAccountResponse, SuiRequestConnect, SuiRequestConnectResponse } from '@/types/message/inject/sui';
import { devLogger } from '@/utils/devLogger';
import { CosmosRPCError, EthereumRPCError, IotaRPCError, SuiRPCError } from '@/utils/error';
import { fetchGnoAccount } from '@/utils/gno/fetch/account';
import { fetchGnoBalance } from '@/utils/gno/fetch/balance';
import { getExtensionLocalStorage } from '@/utils/storage';
import { getAptosDefaultStorageData, getBitcoinDefaultStorageData, getCurrentGnoNetwork, getSolanaDefaultStorageData } from '@/utils/storage/localStorage';
import { addHexPrefix } from '@/utils/string';

import { ContentsContainer, StyledCircularProgress, TextWrapper } from './-styled';

export default function Entry() {
  return (
    <>
      <LoadingSpinner />
      <BusinessLogic />
    </>
  );
}

const LoadingSpinner = memo(function LoadingSpinner() {
  const { t } = useTranslation();

  return (
    <BaseBody>
      <ContentsContainer>
        <StyledCircularProgress size={50} />
        <TextWrapper>
          <Base1300Text variant="b1_B">{t('pages.popup.request-account.entry.connecting')}</Base1300Text>
        </TextWrapper>
      </ContentsContainer>
    </BaseBody>
  );
});

function BusinessLogic() {
  const { requestQueue, currentRequestQueue, deQueue } = useCurrentRequestQueue();
  const [processedRequestIds, setProcessedRequestIds] = useState<Set<string>>(new Set());

  const { currentPreferAccountType } = useCurrentPreferAccountTypes();
  const { chainList } = useChainList();

  const { currentPassword } = useCurrentPassword();
  const { currentAccount, refreshOriginConnectionTime } = useCurrentAccount();

  const rejectFunc = async (currentRequestQueue: RequestQueue) => {
    try {
      sendMessage({
        target: 'CONTENT',
        method: 'responseApp',
        origin: currentRequestQueue.origin,
        requestId: currentRequestQueue.requestId,
        tabId: currentRequestQueue.tabId,
        params: {
          id: currentRequestQueue.requestId,
          error: {
            code: RPC_ERROR.INTERNAL,
            message: `${RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL]}`,
          },
        },
      });
    } catch (error) {
      devLogger.error(`Error in ${currentRequestQueue.requestId}`, error);
    }
  };

  const addProcessedRequestIds = (requestId: string) => {
    setProcessedRequestIds((prev) => new Set(prev).add(requestId));
  };

  useEffect(() => {
    const handleRequestAccount = async () => {
      if (!currentRequestQueue) return;

      const { requestId, method, tabId, origin } = currentRequestQueue;

      if (processedRequestIds.has(requestId)) {
        return;
      }
      addProcessedRequestIds(requestId);

      try {
        switch (method) {
          case 'cos_requestAccount': {
            if (!currentPassword) {
              await rejectFunc(currentRequestQueue);
              break;
            }

            const { params } = currentRequestQueue;

            const allCosmosChains = chainList?.allCosmosChains || [];

            const selectedChain = allCosmosChains.filter((item) => item.chainId === params?.chainName);

            const chainName = selectedChain.length === 1 ? selectedChain[0].name.toLowerCase() : params?.chainName?.toLowerCase();

            const chain = allCosmosChains.find((item) => item.name.toLowerCase() === chainName);

            if (!chain) {
              await rejectFunc(currentRequestQueue);
              break;
            }

            const inAppSelectedPreferAccountType = currentPreferAccountType?.[chain.id];

            const updatedChain = produce(chain, (draft) => {
              if (inAppSelectedPreferAccountType) {
                draft.accountTypes = draft.accountTypes.filter(
                  (item) => item.pubkeyStyle === inAppSelectedPreferAccountType?.pubkeyStyle && item.hdPath === inAppSelectedPreferAccountType?.hdPath,
                );
              }

              if (draft.id === 'sei') {
                draft.accountTypes = draft.accountTypes.map((item) => {
                  if (item.pubkeyStyle === 'keccak256') {
                    return {
                      hdPath: "m/44'/60'/0'/0/${index}",
                      pubkeyStyle: 'secp256k1',
                      pubkeyType: '/cosmos.crypto.secp256k1.PubKey',
                    };
                  }
                  return item;
                });
              }
            });

            if (!updatedChain.accountTypes || updatedChain.accountTypes.length === 0) {
              sendMessage<ResponseAppMessage<CosRequestAccount>>({
                target: 'CONTENT',
                method: 'responseApp',
                origin,
                requestId,
                tabId,
                params: {
                  id: requestId,
                  error: {
                    code: RPC_ERROR.INTERNAL,
                    message: 'No valid account type found for chain',
                  },
                },
              });
              break;
            }

            const keyPair = getKeypair(updatedChain, currentAccount, currentPassword);

            if (!keyPair?.publicKey) {
              await rejectFunc(currentRequestQueue);
              break;
            }

            const address = getAddress(updatedChain, keyPair.publicKey);
            const publicKey = keyPair.publicKey;
            const accountType = updatedChain.accountTypes[0];
            const isEthermint = accountType.pubkeyStyle === 'keccak256';
            const publicKeyTypeUrl = accountType.pubkeyType || '/cosmos.crypto.secp256k1.PubKey';

            const result: CosRequestAccountResponse = {
              address,
              publicKey,
              publicKeyTypeUrl,
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

            void refreshOriginConnectionTime(origin);

            break;
          }

          case 'cos_requestAccountsSettled': {
            if (!currentPassword) {
              await rejectFunc(currentRequestQueue);
              break;
            }

            const currentAccountAddressInfo = await getExtensionLocalStorage(`${currentAccount.id}-address`);

            const { params } = currentRequestQueue;

            const inputChainIds = params.chainIds;

            if (!chainList.cosmosChains || chainList.cosmosChains.length === 0) {
              await rejectFunc(currentRequestQueue);
              break;
            }

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

              const updatedChain = produce(targetChain, (draft) => {
                if (inAppSelectedPreferAccountType) {
                  draft.accountTypes = draft.accountTypes.filter(
                    (item) => item.pubkeyStyle === inAppSelectedPreferAccountType?.pubkeyStyle && item.hdPath === inAppSelectedPreferAccountType?.hdPath,
                  );
                }

                if (draft.id === 'sei') {
                  draft.accountTypes = draft.accountTypes.map((item) => {
                    if (item.pubkeyStyle === 'keccak256') {
                      return {
                        hdPath: "m/44'/60'/0'/0/${index}",
                        pubkeyStyle: 'secp256k1',
                        pubkeyType: '/cosmos.crypto.secp256k1.PubKey',
                      };
                    }
                    return item;
                  });
                }
              });

              const matchedAddressInfo = currentAccountAddressInfo.find(
                (info) => info.chainId === updatedChain.id && info.chainType === 'cosmos' && info.accountType.hdPath === updatedChain.accountTypes[0].hdPath,
              );

              if (matchedAddressInfo) {
                const isEthermint = updatedChain.id === 'sei' ? false : matchedAddressInfo.accountType.pubkeyStyle === 'keccak256';
                const publicKeyTypeUrl =
                  updatedChain.id === 'sei'
                    ? '/cosmos.crypto.secp256k1.PubKey'
                    : matchedAddressInfo.accountType.pubkeyType || '/cosmos.crypto.secp256k1.PubKey';

                return {
                  status: 'fulfilled',
                  value: {
                    chainId: inputChainId,
                    address: matchedAddressInfo.address,
                    publicKey: matchedAddressInfo.publicKey,
                    publicKeyTypeUrl,
                    name: currentAccount.name,
                    isLedger: false,
                    isEthermint,
                  },
                };
              }

              if (!updatedChain.accountTypes[0]) {
                return {
                  status: 'rejected',
                  reason: new CosmosRPCError(RPC_ERROR.INTERNAL, 'No valid account type found for chain'),
                };
              }

              const keyPair = getKeypair(updatedChain, currentAccount, currentPassword);

              if (!keyPair?.publicKey) {
                return {
                  status: 'rejected',
                  reason: new CosmosRPCError(RPC_ERROR.INTERNAL, 'No valid account type found for chain'),
                };
              }
              const address = getAddress(updatedChain, keyPair?.publicKey);
              const publicKey = keyPair.publicKey;

              const accountType = updatedChain.accountTypes[0];
              const isEthermint = accountType.pubkeyStyle === 'keccak256';
              const publicKeyTypeUrl = accountType.pubkeyType || '/cosmos.crypto.secp256k1.PubKey';

              return {
                status: 'fulfilled',
                value: {
                  chainId: inputChainId,
                  address,
                  publicKey,
                  publicKeyTypeUrl,
                  name: currentAccount.name,
                  isLedger: false,
                  isEthermint,
                },
              };
            });

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
            void refreshOriginConnectionTime(origin);

            break;
          }

          case 'eth_requestAccounts':
          case 'wallet_requestPermissions': {
            if (!currentPassword) {
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
              break;
            }

            const evmChains = (await getChains()).evmChains;
            const evmChain = evmChains?.find((item) => item.chainId === '0x1') || evmChains?.[0];

            if (!evmChain) {
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
              break;
            }

            const keyPair = getKeypair(evmChain, currentAccount, currentPassword);

            if (!keyPair?.publicKey) {
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
              break;
            }

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

            void refreshOriginConnectionTime(origin);

            break;
          }

          case 'sui_connect': {
            const result: SuiRequestConnectResponse = null;

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

            void refreshOriginConnectionTime(origin);

            break;
          }

          case 'sui_getAccount': {
            if (!currentPassword) {
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
              break;
            }

            const suiChains = (await getChains()).suiChains;
            const suiChain = suiChains?.find((item) => item.id === 'sui') || suiChains?.[0];

            if (!suiChain) {
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
              break;
            }

            const keyPair = getKeypair(suiChain, currentAccount, currentPassword);

            if (!keyPair?.publicKey) {
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
              break;
            }

            const address = getAddress(suiChain, keyPair.publicKey);

            const publicKey = addHexPrefix(keyPair.publicKey);

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

            void refreshOriginConnectionTime(origin);

            break;
          }

          case 'bit_requestAccount': {
            if (!currentPassword) {
              await rejectFunc(currentRequestQueue);
              break;
            }

            const { currentBitcoinNetwork } = await getBitcoinDefaultStorageData();

            if (!currentBitcoinNetwork) {
              await rejectFunc(currentRequestQueue);
              break;
            }

            const keyPair = getKeypair(currentBitcoinNetwork, currentAccount, currentPassword);

            if (!keyPair?.publicKey) {
              await rejectFunc(currentRequestQueue);
              break;
            }
            const address = getAddress(currentBitcoinNetwork, keyPair.publicKey);

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

            void refreshOriginConnectionTime(origin);

            break;
          }

          case 'aptos_account':
          case 'aptos_connect': {
            if (!currentPassword) {
              await rejectFunc(currentRequestQueue);
              break;
            }

            const { currentAptosNetwork } = await getAptosDefaultStorageData();

            if (!currentAptosNetwork) {
              await rejectFunc(currentRequestQueue);
              break;
            }

            const keyPair = getKeypair(currentAptosNetwork, currentAccount, currentPassword);

            if (!keyPair?.publicKey) {
              await rejectFunc(currentRequestQueue);
              break;
            }

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

            void refreshOriginConnectionTime(origin);

            break;
          }

          case 'iota_connect': {
            const result: IotaRequestConnectResponse = null;

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

            void refreshOriginConnectionTime(origin);

            break;
          }

          case 'iota_getAccount': {
            if (!currentPassword) {
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
              break;
            }

            const iotaChains = (await getChains()).iotaChains;
            const iotaChain = iotaChains?.find((item) => item.id === 'iota') || iotaChains?.[0];

            if (!iotaChain) {
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
              break;
            }

            const keyPair = getKeypair(iotaChain, currentAccount, currentPassword);

            if (!keyPair?.publicKey) {
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
              break;
            }

            const address = getAddress(iotaChain, keyPair.publicKey);
            const publicKey = addHexPrefix(keyPair.publicKey);

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

            void refreshOriginConnectionTime(origin);

            break;
          }

          case 'solana_connect': {
            if (!currentPassword) {
              await rejectFunc(currentRequestQueue);
              break;
            }

            const { currentSolanaNetwork } = await getSolanaDefaultStorageData();

            if (!currentSolanaNetwork) {
              await rejectFunc(currentRequestQueue);
              break;
            }

            const keyPair = getKeypair(currentSolanaNetwork, currentAccount, currentPassword);

            if (!keyPair?.publicKey) {
              await rejectFunc(currentRequestQueue);
              break;
            }

            const result = { publicKey: keyPair.publicKey as unknown as PublicKey };

            sendMessage<ResponseAppMessage<SolanaConnect>>({
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

            void refreshOriginConnectionTime(origin);

            break;
          }

          case 'gno_connect': {
            const result: GnoConnectResponse = {
              code: 0,
              status: GNO_RESPONSE_STATUS.SUCCESS,
              message: GNO_MESSAGE.CONNECTION_SUCCESS,
              data: {},
            };

            sendMessage<ResponseAppMessage<GnoConnect>>({
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
            void refreshOriginConnectionTime(origin);

            break;
          }

          case 'gno_getAccount': {
            if (!currentPassword) {
              await rejectFunc(currentRequestQueue);
              break;
            }

            const { currentGnoNetwork } = await getCurrentGnoNetwork();

            const keyPair = getKeypair(currentGnoNetwork, currentAccount, currentPassword);
            const address = getAddress(currentGnoNetwork, keyPair.publicKey);

            const rpcURLs = currentGnoNetwork.rpcUrls.map((item) => item.url) || [];

            const account = await fetchGnoAccount(address, rpcURLs);

            const balance = await fetchGnoBalance(address, rpcURLs);

            if (!account) {
              const inActiveAccount = {
                address,
                coins: '',
                chainId: currentGnoNetwork.chainId,
                status: EAccountStatus.INACTIVE,
                publicKey: null,
                accountNumber: '0',
                sequence: '0',
              };

              const result: GnoGetAccountResponse = {
                code: 0,
                status: GNO_RESPONSE_STATUS.SUCCESS,
                message: '',
                data: inActiveAccount,
              };

              await sendMessage<ResponseAppMessage<GnoConnect>>({
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
              return;
            }

            const result: GnoGetAccountResponse = {
              code: 0,
              status: GNO_RESPONSE_STATUS.SUCCESS,
              message: 'Get Account Information.',
              data: {
                address,
                coins: `${balance}${currentGnoNetwork.mainAssetDenom || ''}`,
                chainId: currentGnoNetwork.id,
                status: EAccountStatus.ACTIVE,
                publicKey: account.publicKey || null,
                accountNumber: account.account_number || '0',
                sequence: account.sequence || '0',
              },
            };

            sendMessage<ResponseAppMessage<GnoConnect>>({
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

            void refreshOriginConnectionTime(origin);

            break;
          }

          default:
            devLogger.warn(`Unknown method: ${method}`);
        }
      } catch (error) {
        devLogger.error(`Error processing ${requestId}:`, error);
        await rejectFunc(currentRequestQueue);
      } finally {
        await deQueue();
      }
    };

    if (!currentRequestQueue) return;

    const shouldApplyPopdownDelay = processedRequestIds.size < 5 && requestQueue.length === 1;

    if (shouldApplyPopdownDelay) {
      const timer = setTimeout(() => {
        handleRequestAccount();
      }, 500);

      return () => clearTimeout(timer);
    } else {
      handleRequestAccount();
    }
  }, [
    chainList.allCosmosChains,
    chainList.cosmosChains,
    currentAccount,
    currentPassword,
    currentPreferAccountType,
    currentRequestQueue,
    deQueue,
    processedRequestIds,
    refreshOriginConnectionTime,
    currentRequestQueue?.requestId,
    requestQueue.length,
  ]);

  return null;
}
