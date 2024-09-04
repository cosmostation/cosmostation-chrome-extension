import encHex from 'crypto-js/enc-hex';
import sha256 from 'crypto-js/sha256';
import { debounce } from 'lodash';
import sortKeys from 'sort-keys';
import TinySecp256k1 from 'tiny-secp256k1';
import { v4 as uuidv4 } from 'uuid';
import Web3 from 'web3';
import { keccak256 } from '@ethersproject/keccak256';
import type { MessageTypes } from '@metamask/eth-sig-util';
import { SignTypedDataVersion } from '@metamask/eth-sig-util';

import { COSMOS_CHAINS, ETHEREUM_NETWORKS } from '~/constants/chain';
import { APTOS } from '~/constants/chain/aptos/aptos';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { SUI } from '~/constants/chain/sui/sui';
import { PRIVATE_KEY_FOR_TEST } from '~/constants/common';
import {
  APTOS_RPC_ERROR_MESSAGE,
  COSMOS_RPC_ERROR_MESSAGE,
  ETHEREUM_RPC_ERROR_MESSAGE,
  RPC_ERROR,
  RPC_ERROR_MESSAGE,
  SUI_RPC_ERROR_MESSAGE,
} from '~/constants/error';
import type { TOKEN_TYPE } from '~/constants/ethereum';
import { LEDGER_SUPPORT_COIN_TYPE } from '~/constants/ledger';
import { APTOS_METHOD_TYPE, APTOS_NO_POPUP_METHOD_TYPE, APTOS_POPUP_METHOD_TYPE } from '~/constants/message/aptos';
import { COMMON_METHOD_TYPE, COMMON_NO_POPUP_METHOD_TYPE } from '~/constants/message/common';
import { COSMOS_METHOD_TYPE, COSMOS_NO_POPUP_METHOD_TYPE, COSMOS_POPUP_METHOD_TYPE } from '~/constants/message/cosmos';
import { ETHEREUM_METHOD_TYPE, ETHEREUM_NO_POPUP_METHOD_TYPE, ETHEREUM_POPUP_METHOD_TYPE } from '~/constants/message/ethereum';
import { SUI_METHOD_TYPE, SUI_NO_POPUP_METHOD_TYPE, SUI_POPUP_METHOD_TYPE } from '~/constants/message/sui';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { AptosRPCError, CommonRPCError, CosmosRPCError, EthereumRPCError, SuiRPCError } from '~/Popup/utils/error';
import { requestRPC as ethereumRequestRPC, signTypedData } from '~/Popup/utils/ethereum';
import { extensionSessionStorage } from '~/Popup/utils/extensionSessionStorage';
import { extensionStorage, getStorage, setStorage } from '~/Popup/utils/extensionStorage';
import { openWindow } from '~/Popup/utils/extensionWindows';
import { responseToWeb } from '~/Popup/utils/message';
import { isEqualsIgnoringCase, toHex } from '~/Popup/utils/string';
import { requestRPC as suiRequestRPC } from '~/Popup/utils/sui';
import type { CosmosChain, CosmosToken } from '~/types/chain';
import type { SendTransactionPayload } from '~/types/cosmos/common';
import type { CW20BalanceResponse, CW20TokenInfoResponse } from '~/types/cosmos/contract';
import type { ResponseRPC } from '~/types/ethereum/rpc';
import type { Queue } from '~/types/extensionStorage';
import type { ContentScriptToBackgroundEventMessage, RequestMessage } from '~/types/message';
import type { AptosConnectResponse, AptosIsConnectedResponse, AptosNetworkResponse, AptosSignMessage, AptosSignTransaction } from '~/types/message/aptos';
import type { ComProvidersResponse } from '~/types/message/common';
import type {
  CosAccountResponse,
  CosActivatedChainIdsResponse,
  CosActivatedChainNamesResponse,
  CosAddChain,
  CosAddNFTsCW721,
  CosAddTokensCW20Internal,
  CosRequestAccountResponse,
  CosSendTransactionResponse,
  CosSignAmino,
  CosSignDirect,
  CosSignMessage,
  CosSupportedChainIdsResponse,
  CosSupportedChainNamesResponse,
  CosVerifyMessage,
  CosVerifyMessageResponse,
} from '~/types/message/cosmos';
import type {
  CustomTypedMessage,
  EthcAddNetwork,
  EthcAddTokens,
  EthCoinbaseResponse,
  EthcSwitchNetwork,
  EthcSwitchNetworkResponse,
  EthRequestAccountsResponse,
  EthSign,
  EthSignTransaction,
  EthSignTypedData,
  PersonalSign,
  WalletAddEthereumChain,
  WalletSwitchEthereumChain,
  WalletSwitchEthereumChainResponse,
  WalletWatchAsset,
} from '~/types/message/ethereum';
import type { SuiConnect, SuiConnectResponse, SuiGetAccountResponse, SuiGetChainResponse, SuiSignMessage } from '~/types/message/sui';

import {
  aptosSignMessageSchema,
  aptosSignTransactionSchema,
  cosAddChainParamsSchema,
  cosAddNFTsCW721ParamsSchema,
  cosAddTokensCW20ParamsSchema,
  cosGetBalanceCW20ParamsSchema,
  cosGetTokenInfoCW20ParamsSchema,
  cosSendTransactionParamsSchema,
  cosSignAminoParamsSchema,
  cosSignDirectParamsSchema,
  cosSignMessageParamsSchema,
  cosVerifyMessageParamsSchema,
  ethcAddNetworkParamsSchema,
  ethcAddTokensParamsSchema,
  ethcSwitchNetworkParamsSchema,
  ethSignParamsSchema,
  ethSignTransactionParamsSchema,
  ethSignTypedDataParamsSchema,
  personalSignParamsSchema,
  suiConnectSchema,
  suiSignMessageSchema,
  walletAddEthereumChainParamsSchema,
  walletSwitchEthereumChainParamsSchema,
  WalletWatchAssetParamsSchema,
} from './joiSchema';
import { cosmosURL, getMsgSignData } from '../utils/cosmos';
import { FetchError, get, post } from '../utils/fetch';

let localQueues: Queue[] = [];

const setQueues = debounce(
  async () => {
    const queues = localQueues;
    localQueues = [];

    const currentQueue = await getStorage('queues');

    const window = await openWindow();
    await setStorage('queues', [
      ...currentQueue.map((item) => ({ ...item, windowId: window?.id })),
      ...queues.map((item) => ({ ...item, windowId: window?.id })),
    ]);
  },
  500,
  { leading: true },
);

// contentScrpit to background
export async function cstob(request: ContentScriptToBackgroundEventMessage<RequestMessage>) {
  if (request.line === 'COMMON') {
    const commonNoPopupMethods = Object.values(COMMON_NO_POPUP_METHOD_TYPE) as string[];
    const commonMethods = Object.values(COMMON_METHOD_TYPE) as string[];

    const { message, messageId, origin } = request;

    try {
      if (!message?.method || !commonMethods.includes(message.method)) {
        throw new CommonRPCError(RPC_ERROR.METHOD_NOT_SUPPORTED, RPC_ERROR_MESSAGE[RPC_ERROR.METHOD_NOT_SUPPORTED]);
      }
      const { method } = message;

      const { providers } = await extensionStorage();

      if (commonNoPopupMethods.includes(method)) {
        if (method === 'com_providers') {
          const response: ComProvidersResponse = providers;

          responseToWeb({
            response: {
              result: response,
            },
            message,
            messageId,
            origin,
          });
        }
      }
    } catch (e) {
      if (e instanceof CommonRPCError) {
        responseToWeb({
          response: e.rpcMessage,
          message,
          messageId,
          origin,
        });
        return;
      }

      responseToWeb({
        response: {
          error: {
            code: RPC_ERROR.INTERNAL,
            message: `${RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL]}`,
          },
        },
        message,
        messageId,
        origin,
      });
    }
  }

  if (request.line === 'COSMOS') {
    const cosmosMethods = Object.values(COSMOS_METHOD_TYPE) as string[];
    const cosmosPopupMethods = Object.values(COSMOS_POPUP_METHOD_TYPE) as string[];
    const cosmosNoPopupMethods = Object.values(COSMOS_NO_POPUP_METHOD_TYPE) as string[];

    const { message, messageId, origin } = request;

    try {
      if (!message?.method || !cosmosMethods.includes(message.method)) {
        throw new CosmosRPCError(RPC_ERROR.METHOD_NOT_SUPPORTED, RPC_ERROR_MESSAGE[RPC_ERROR.METHOD_NOT_SUPPORTED]);
      }

      const { method } = message;

      const { currentAccount, currentAccountName, additionalChains, currentAllowedChains, currentAccountAllowedOrigins, accounts, allowedOrigins } =
        await extensionStorage();

      const { currentPassword } = await extensionSessionStorage();

      if (accounts.length === 0) {
        throw new CosmosRPCError(RPC_ERROR.INVALID_REQUEST, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_REQUEST]);
      }

      const cosmosCurrentAllowedChains = currentAllowedChains.filter((item) => item.line === 'COSMOS') as CosmosChain[];
      const cosmosAdditionalChains = additionalChains.filter((item) => item.line === 'COSMOS') as CosmosChain[];

      const allChains = [...COSMOS_CHAINS, ...cosmosAdditionalChains];
      const allChainLowercaseNames = allChains.map((item) => item.chainName.toLowerCase());

      const getChain = (chainName?: string) => allChains.find((item) => item.chainName.toLowerCase() === chainName?.toLowerCase());

      if (cosmosPopupMethods.includes(method)) {
        if (method === 'cos_requestAccount' || method === 'ten_requestAccount') {
          const { params } = message;

          const selectedChain = allChains.filter((item) => item.chainId === params?.chainName);

          const chainName = selectedChain.length === 1 ? selectedChain[0].chainName.toLowerCase() : params?.chainName?.toLowerCase();

          if (!allChainLowercaseNames.includes(chainName)) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
          }

          const chain = getChain(chainName)!;

          if (currentAccount.type === 'LEDGER' && chain.bip44.coinType !== LEDGER_SUPPORT_COIN_TYPE.COSMOS) {
            throw new CosmosRPCError(RPC_ERROR.LEDGER_UNSUPPORTED_CHAIN, COSMOS_RPC_ERROR_MESSAGE[RPC_ERROR.LEDGER_UNSUPPORTED_CHAIN]);
          }

          if (
            chain.id &&
            currentAccountAllowedOrigins.includes(origin) &&
            currentPassword &&
            (currentAccount.type !== 'LEDGER' || (currentAccount.type === 'LEDGER' && currentAccount.cosmosPublicKey))
          ) {
            const keyPair = getKeyPair(currentAccount, chain, currentPassword);
            const address = getAddress(chain, keyPair?.publicKey);

            const publicKey = keyPair?.publicKey.toString('hex') || '';

            const result: CosRequestAccountResponse = {
              address,
              publicKey,
              name: currentAccountName,
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
          } else {
            localQueues.push({ ...request, message: { ...request.message, method, params: { chainName: chain.chainName } } });
            void setQueues();
          }
        }

        if (method === 'cos_addChain' || method === 'ten_addChain') {
          const { params } = message;

          const cosmosLowercaseChainNames = COSMOS_CHAINS.map((item) => item.chainName.toLowerCase());
          const officialCosmosLowercaseChainIds = COSMOS_CHAINS.map((item) => item.chainId.toLowerCase());
          const unofficialCosmosLowercaseChainIds = cosmosAdditionalChains.map((item) => item.chainId.toLowerCase());

          if (cosmosLowercaseChainNames.includes(params.chainName) || officialCosmosLowercaseChainIds.includes(params.chainId)) {
            responseToWeb({
              response: {
                result: true,
              },
              message,
              messageId,
              origin,
            });
          } else {
            try {
              const schema = cosAddChainParamsSchema(cosmosLowercaseChainNames, officialCosmosLowercaseChainIds, unofficialCosmosLowercaseChainIds);

              const validatedParams = (await schema.validateAsync(params)) as CosAddChain['params'];

              const filteredCosmosLowercaseChainIds = cosmosAdditionalChains
                .filter((item) => item.chainName.toLowerCase() !== validatedParams.chainName)
                .map((item) => item.chainId.toLowerCase());

              if (filteredCosmosLowercaseChainIds.includes(validatedParams.chainId)) {
                throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]}: 'chainId' is a duplicate`);
              }

              localQueues.push({
                ...request,
                message: { ...request.message, method, params: { ...validatedParams, chainName: params.chainName } as CosAddChain['params'] },
              });
              void setQueues();
            } catch (err) {
              if (err instanceof CosmosRPCError) {
                throw err;
              }

              throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
            }
          }
        }

        if (method === 'cos_signAmino' || method === 'ten_signAmino') {
          const { params } = message;

          const selectedChain = allChains.filter((item) => item.chainId === params?.chainName);

          const chainName = selectedChain.length === 1 ? selectedChain[0].chainName : params?.chainName;

          const chain = getChain(chainName);

          const schema = cosSignAminoParamsSchema(allChainLowercaseNames, chain ? chain.chainId : '');

          if (currentAccount.type === 'LEDGER' && chain?.bip44.coinType !== LEDGER_SUPPORT_COIN_TYPE.COSMOS) {
            throw new CosmosRPCError(RPC_ERROR.LEDGER_UNSUPPORTED_CHAIN, COSMOS_RPC_ERROR_MESSAGE[RPC_ERROR.LEDGER_UNSUPPORTED_CHAIN]);
          }

          try {
            const validatedParams = (await schema.validateAsync({ ...params, chainName })) as CosSignAmino['params'];

            localQueues.push({
              ...request,
              message: { ...request.message, method, params: { ...validatedParams, chainName: chain?.chainName } as CosSignAmino['params'] },
            });
            void setQueues();
          } catch (err) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
          }
        }

        if (method === 'cos_signDirect' || method === 'ten_signDirect') {
          if (currentAccount.type === 'LEDGER') {
            throw new CosmosRPCError(RPC_ERROR.LEDGER_UNSUPPORTED_METHOD, COSMOS_RPC_ERROR_MESSAGE[RPC_ERROR.LEDGER_UNSUPPORTED_METHOD]);
          }

          const { params } = message;

          const selectedChain = allChains.filter((item) => item.chainId === params?.chainName);

          const chainName = selectedChain.length === 1 ? selectedChain[0].chainName : params?.chainName;

          const chain = getChain(chainName);

          const schema = cosSignDirectParamsSchema(allChainLowercaseNames, chain ? chain.chainId : '');

          try {
            const validatedParams = (await schema.validateAsync({ ...params, chainName })) as CosSignDirect['params'];

            localQueues.push({
              ...request,
              message: { ...request.message, method, params: { ...validatedParams, chainName: chain?.chainName } as CosSignDirect['params'] },
            });
            void setQueues();
          } catch (err) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
          }
        }

        if (method === 'cos_signMessage') {
          const { params } = message;

          const selectedChain = allChains.filter((item) => item.chainId === params?.chainName);

          const chainName = selectedChain.length === 1 ? selectedChain[0].chainName : params?.chainName;

          const chain = getChain(chainName);

          if (!chain) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
          }

          const schema = cosSignMessageParamsSchema(allChainLowercaseNames);

          if (currentAccount.type === 'LEDGER' && chain?.bip44.coinType !== LEDGER_SUPPORT_COIN_TYPE.COSMOS) {
            throw new CosmosRPCError(RPC_ERROR.LEDGER_UNSUPPORTED_CHAIN, COSMOS_RPC_ERROR_MESSAGE[RPC_ERROR.LEDGER_UNSUPPORTED_CHAIN]);
          }

          try {
            const validatedParams = (await schema.validateAsync({ ...params, chainName })) as CosSignMessage['params'];

            localQueues.push({
              ...request,
              message: { ...request.message, method, params: { ...validatedParams, chainName: chain?.chainName } as CosSignMessage['params'] },
            });
            void setQueues();
          } catch (err) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
          }
        }

        if (method === 'cos_addTokensCW20') {
          const { params } = message;

          const cosmWasmChains = allChains.filter((item) => item.cosmWasm);
          const cosmWasmChainLowercaseNames = cosmWasmChains.map((item) => item.chainName.toLowerCase());

          const selectedChain = cosmWasmChains.filter((item) => item.chainId === params?.chainName);

          const chainName = selectedChain.length === 1 ? selectedChain[0].chainName.toLowerCase() : params?.chainName?.toLowerCase();

          if (!allChainLowercaseNames.includes(chainName)) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
          }

          const chain = getChain(chainName);

          if (!chain) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
          }

          const schema = cosAddTokensCW20ParamsSchema(cosmWasmChainLowercaseNames, chain);

          try {
            await schema.validateAsync({ ...params, chainName });
          } catch (err) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
          }

          try {
            const { getCW20TokenInfo } = cosmosURL(chain);

            const uniqueTokens = params.tokens.filter((token, idx, arr) => arr.findIndex((item) => item.contractAddress === token.contractAddress) === idx);

            const cosmosTokens = (
              await Promise.all(
                uniqueTokens.map(async (token) => {
                  try {
                    const response = await get<CW20TokenInfoResponse>(getCW20TokenInfo(token.contractAddress));
                    const result = response.data;
                    const cosmosToken: CosmosToken = {
                      id: uuidv4(),
                      address: token.contractAddress,
                      chainId: chain.id,
                      decimals: result.decimals,
                      displayDenom: result.symbol,
                      tokenType: 'CW20',
                      coinGeckoId: token.coinGeckoId,
                      imageURL: token.imageURL,
                    };

                    return cosmosToken;
                  } catch {
                    return null;
                  }
                }),
              )
            ).filter((item) => item !== null) as CosmosToken[];

            if (cosmosTokens.length === 0) {
              throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
            }

            localQueues.push({
              ...request,
              message: {
                ...request.message,
                method: 'cos_addTokensCW20Internal',
                params: { chainName: chain.chainName, tokens: cosmosTokens } as CosAddTokensCW20Internal['params'],
              },
            });
            void setQueues();
          } catch (err) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
          }
        }

        if (method === 'cos_addNFTsCW721') {
          const { params } = message;

          const cosmWasmChains = allChains.filter((item) => item.cosmWasm);
          const cosmWasmChainLowercaseNames = cosmWasmChains.map((item) => item.chainName.toLowerCase());

          const selectedChain = cosmWasmChains.filter((item) => item.chainId === params?.chainName);

          const chainName = selectedChain.length === 1 ? selectedChain[0].chainName.toLowerCase() : params?.chainName?.toLowerCase();

          if (!allChainLowercaseNames.includes(chainName)) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
          }

          const chain = getChain(chainName);

          if (!chain) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
          }

          const schema = cosAddNFTsCW721ParamsSchema(cosmWasmChainLowercaseNames, chain);

          try {
            await schema.validateAsync({ ...params, chainName });
          } catch (err) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
          }

          try {
            const cosmosNFTs = params.nfts
              .filter((item) => item.contractAddress !== null && item.tokenId !== null)
              .filter((nft, idx, arr) => arr.findIndex((item) => item.contractAddress === nft.contractAddress && item.tokenId === nft.tokenId) === idx);

            if (cosmosNFTs.length === 0) {
              throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
            }

            localQueues.push({
              ...request,
              message: {
                ...request.message,
                method: 'cos_addNFTsCW721',
                params: { chainName: chain.chainName, nfts: cosmosNFTs } as CosAddNFTsCW721['params'],
              },
            });
            void setQueues();
          } catch (err) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
          }
        }
      } else if (cosmosNoPopupMethods.includes(message.method)) {
        if (method === 'cos_supportedChainNames' || method === 'ten_supportedChainNames') {
          const official = COSMOS_CHAINS.map((item) => item.chainName.toLowerCase());

          const unofficial = cosmosAdditionalChains.map((item) => item.chainName.toLowerCase());

          const response: CosSupportedChainNamesResponse = { official, unofficial };

          responseToWeb({
            response: {
              result: response,
            },
            message,
            messageId,
            origin,
          });
        }

        if (method === 'cos_supportedChainIds') {
          const official = COSMOS_CHAINS.map((item) => item.chainId);

          const unofficial = cosmosAdditionalChains.map((item) => item.chainId);

          const response: CosSupportedChainIdsResponse = { official, unofficial };

          responseToWeb({
            response: {
              result: response,
            },
            message,
            messageId,
            origin,
          });
        }

        if (method === 'cos_activatedChainNames') {
          const response: CosActivatedChainNamesResponse = [
            ...cosmosCurrentAllowedChains.map((item) => item.chainName.toLowerCase()),
            ...cosmosAdditionalChains.map((item) => item.chainName.toLowerCase()),
          ];

          responseToWeb({
            response: {
              result: response,
            },
            message,
            messageId,
            origin,
          });
        }

        if (method === 'cos_activatedChainIds') {
          const response: CosActivatedChainIdsResponse = [
            ...cosmosCurrentAllowedChains.map((item) => item.chainId),
            ...cosmosAdditionalChains.map((item) => item.chainId),
          ];

          responseToWeb({
            response: {
              result: response,
            },
            message,
            messageId,
            origin,
          });
        }

        if (method === 'cos_account' || method === 'ten_account') {
          const { params } = message;

          const selectedChain = allChains.filter((item) => item.chainId === params?.chainName);

          const chainName = selectedChain.length === 1 ? selectedChain[0].chainName.toLowerCase() : params?.chainName?.toLowerCase();

          if (!allChainLowercaseNames.includes(chainName)) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
          }

          const chain = getChain(chainName);

          if (currentAccount.type === 'LEDGER' && chain?.bip44.coinType !== LEDGER_SUPPORT_COIN_TYPE.COSMOS) {
            throw new CosmosRPCError(RPC_ERROR.LEDGER_UNSUPPORTED_CHAIN, COSMOS_RPC_ERROR_MESSAGE[RPC_ERROR.LEDGER_UNSUPPORTED_CHAIN]);
          }

          if (chain?.id && currentAccountAllowedOrigins.includes(origin) && currentPassword) {
            const keyPair = getKeyPair(currentAccount, chain, currentPassword);
            const address = getAddress(chain, keyPair?.publicKey);

            const publicKey = keyPair?.publicKey.toString('hex') || '';

            const result: CosAccountResponse = {
              address,
              publicKey,
              name: currentAccountName,
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
          } else {
            if (!currentAccountAllowedOrigins.includes(origin) || !currentPassword) {
              throw new CosmosRPCError(RPC_ERROR.UNAUTHORIZED, COSMOS_RPC_ERROR_MESSAGE[RPC_ERROR.UNAUTHORIZED]);
            }

            throw new CosmosRPCError(RPC_ERROR.INVALID_INPUT, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_INPUT]);
          }
        }

        if (method === 'cos_sendTransaction') {
          const { params } = message;

          const selectedChain = allChains.filter((item) => item.chainId === params?.chainName);

          const chainName = selectedChain.length === 1 ? selectedChain[0].chainName.toLowerCase() : params?.chainName?.toLowerCase();

          if (!allChainLowercaseNames.includes(chainName)) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
          }

          const chain = getChain(chainName);

          if (!chain) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
          }

          const schema = cosSendTransactionParamsSchema(allChainLowercaseNames);

          try {
            await schema.validateAsync({ ...params, chainName });
          } catch (err) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
          }

          try {
            const response: CosSendTransactionResponse = await post<SendTransactionPayload>(`${chain.restURL}/cosmos/tx/v1beta1/txs`, {
              tx_bytes: params.txBytes,
              mode: params.mode,
            });

            responseToWeb({
              response: {
                result: response,
              },
              message,
              messageId,
              origin,
            });
          } catch (e) {
            if (e instanceof FetchError) {
              responseToWeb({
                response: {
                  error: {
                    code: RPC_ERROR.INTERNAL,
                    message: RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL],
                    data: { status: e.data.status, statusText: e.data.statusText, message: await e.data.text() },
                  },
                },
                message,
                messageId,
                origin,
              });
            } else {
              responseToWeb({
                response: {
                  error: {
                    code: RPC_ERROR.INTERNAL,
                    message: RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL],
                  },
                },
                message,
                messageId,
                origin,
              });
            }
          }
        }

        if (method === 'cos_getBalanceCW20') {
          const { params } = message;

          const cosmWasmChains = allChains.filter((item) => item.cosmWasm);
          const cosmWasmChainLowercaseNames = cosmWasmChains.map((item) => item.chainName.toLowerCase());

          const selectedChain = cosmWasmChains.filter((item) => item.chainId === params?.chainName);

          const chainName = selectedChain.length === 1 ? selectedChain[0].chainName.toLowerCase() : params?.chainName?.toLowerCase();

          if (!allChainLowercaseNames.includes(chainName)) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
          }

          const chain = getChain(chainName);

          if (!chain) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
          }

          const schema = cosGetBalanceCW20ParamsSchema(cosmWasmChainLowercaseNames, chain);

          try {
            await schema.validateAsync({ ...params, chainName });
          } catch (err) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
          }

          try {
            const { getCW20Balance } = cosmosURL(chain);
            const response = await get<CW20BalanceResponse>(getCW20Balance(params.contractAddress, params.address));

            const amount = response.data.balance || '0';

            responseToWeb({
              response: {
                result: amount,
              },
              message,
              messageId,
              origin,
            });
          } catch (e) {
            if (e instanceof FetchError) {
              responseToWeb({
                response: {
                  error: {
                    code: RPC_ERROR.INTERNAL,
                    message: RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL],
                    data: { status: e.data.status, statusText: e.data.statusText, message: await e.data.text() },
                  },
                },
                message,
                messageId,
                origin,
              });
            } else {
              responseToWeb({
                response: {
                  error: {
                    code: RPC_ERROR.INTERNAL,
                    message: RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL],
                  },
                },
                message,
                messageId,
                origin,
              });
            }
          }
        }

        if (method === 'cos_getTokenInfoCW20') {
          const { params } = message;

          const cosmWasmChains = allChains.filter((item) => item.cosmWasm);
          const cosmWasmChainLowercaseNames = cosmWasmChains.map((item) => item.chainName.toLowerCase());

          const selectedChain = cosmWasmChains.filter((item) => item.chainId === params?.chainName);

          const chainName = selectedChain.length === 1 ? selectedChain[0].chainName.toLowerCase() : params?.chainName?.toLowerCase();

          if (!allChainLowercaseNames.includes(chainName)) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
          }

          const chain = getChain(chainName);

          if (!chain) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
          }

          const schema = cosGetTokenInfoCW20ParamsSchema(cosmWasmChainLowercaseNames, chain);

          try {
            await schema.validateAsync({ ...params, chainName });
          } catch (err) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
          }

          try {
            const { getCW20TokenInfo } = cosmosURL(chain);
            const response = await get<CW20TokenInfoResponse>(getCW20TokenInfo(params.contractAddress));

            const result = response.data;

            responseToWeb({
              response: {
                result,
              },
              message,
              messageId,
              origin,
            });
          } catch (e) {
            if (e instanceof FetchError) {
              responseToWeb({
                response: {
                  error: {
                    code: RPC_ERROR.INTERNAL,
                    message: RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL],
                    data: { status: e.data.status, statusText: e.data.statusText, message: await e.data.text() },
                  },
                },
                message,
                messageId,
                origin,
              });
            } else {
              responseToWeb({
                response: {
                  error: {
                    code: RPC_ERROR.INTERNAL,
                    message: RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL],
                  },
                },
                message,
                messageId,
                origin,
              });
            }
          }
        }

        if (method === 'cos_verifyMessage') {
          const { params } = message;

          const selectedChain = allChains.filter((item) => item.chainId === params?.chainName);

          const chainName = selectedChain.length === 1 ? selectedChain[0].chainName : params?.chainName;

          const chain = getChain(chainName);

          if (!chain) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
          }

          const schema = cosVerifyMessageParamsSchema(allChainLowercaseNames);

          try {
            const validatedParams = (await schema.validateAsync({ ...params, chainName })) as CosVerifyMessage['params'];

            const signDoc = JSON.stringify(sortKeys(getMsgSignData(validatedParams.signer, validatedParams.message)));

            const tx =
              chain?.type === 'ETHERMINT'
                ? keccak256(Buffer.from(signDoc)).substring(2)
                : sha256(JSON.stringify(sortKeys(getMsgSignData(validatedParams.signer, validatedParams.message), { deep: true }))).toString(encHex);

            const result: CosVerifyMessageResponse = TinySecp256k1.verify(
              Buffer.from(tx, 'hex'),
              Buffer.from(validatedParams.publicKey, 'base64'),
              Buffer.from(validatedParams.signature, 'base64'),
              true,
            );

            responseToWeb({
              response: {
                result,
              },
              message,
              messageId,
              origin,
            });
          } catch (err) {
            const result: CosVerifyMessageResponse = false;

            responseToWeb({
              response: {
                result,
              },
              message,
              messageId,
              origin,
            });
          }
        }

        if (method === 'cos_disconnect') {
          const newAllowedOrigins = allowedOrigins.filter((item) => !(item.accountId === currentAccount.id && item.origin === origin));

          await setStorage('allowedOrigins', newAllowedOrigins);

          const result = null;

          responseToWeb({
            response: {
              result,
            },
            message,
            messageId,
            origin,
          });
        }
      } else {
        throw new CosmosRPCError(RPC_ERROR.INVALID_REQUEST, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_REQUEST]);
      }
    } catch (e) {
      if (e instanceof CosmosRPCError) {
        responseToWeb({
          response: e.rpcMessage,
          message,
          messageId,
          origin,
        });
        return;
      }

      responseToWeb({
        response: {
          error: {
            code: RPC_ERROR.INTERNAL,
            message: `${RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL]}`,
          },
        },
        message,
        messageId,
        origin,
      });
    }
  }

  if (request.line === 'ETHEREUM') {
    const chain = ETHEREUM;

    const ethereumMethods = Object.values(ETHEREUM_METHOD_TYPE) as string[];
    const ethereumPopupMethods = Object.values(ETHEREUM_POPUP_METHOD_TYPE) as string[];
    const ethereumNoPopupMethods = Object.values(ETHEREUM_NO_POPUP_METHOD_TYPE) as string[];

    const { additionalEthereumNetworks, currentEthereumNetwork, currentAccountAllowedOrigins, currentAccount } = await extensionStorage();

    const { currentPassword } = await extensionSessionStorage();

    const { message, messageId, origin } = request;

    try {
      if (!message?.method || !ethereumMethods.includes(message.method)) {
        throw new EthereumRPCError(RPC_ERROR.UNSUPPORTED_METHOD, ETHEREUM_RPC_ERROR_MESSAGE[RPC_ERROR.UNSUPPORTED_METHOD], message?.id);
      }

      const { method, id } = message;

      if (ethereumPopupMethods.includes(method)) {
        if (method === 'eth_sign') {
          const { params } = message;

          const schema = ethSignParamsSchema();

          try {
            const validatedParams = (await schema.validateAsync(params)) as EthSign['params'];

            if (currentAccountAllowedOrigins.includes(origin) && currentPassword) {
              const keyPair = getKeyPair(currentAccount, chain, currentPassword);
              const address = getAddress(chain, keyPair?.publicKey);

              if ((currentAccount.type === 'LEDGER' && currentAccount.ethereumPublicKey) || currentAccount.type !== 'LEDGER') {
                if (address.toLowerCase() !== validatedParams[0].toLowerCase()) {
                  throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid address', message.id);
                }
              }
            }

            localQueues.push({
              ...request,
              message: { ...request.message, method, params: [...validatedParams] as EthSign['params'] },
            });
            void setQueues();
          } catch (err) {
            if (err instanceof EthereumRPCError) {
              throw err;
            }

            throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, message.id);
          }
        }

        if (method === 'eth_signTypedData_v3' || method === 'eth_signTypedData_v4') {
          const { params } = message;

          const schema = ethSignTypedDataParamsSchema();

          try {
            const validatedParams = (await schema.validateAsync(params)) as EthSignTypedData['params'];

            if (currentAccountAllowedOrigins.includes(origin) && currentPassword) {
              const keyPair = getKeyPair(currentAccount, chain, currentPassword);
              const address = getAddress(chain, keyPair?.publicKey);
              if ((currentAccount.type === 'LEDGER' && currentAccount.ethereumPublicKey) || currentAccount.type !== 'LEDGER') {
                if (address.toLowerCase() !== validatedParams[0].toLowerCase()) {
                  throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid address', message.id);
                }
              }
            }

            try {
              const param2 = JSON.parse(validatedParams[1]) as CustomTypedMessage<MessageTypes>;

              const currentNetwork = currentEthereumNetwork;

              const chainId = param2?.domain?.chainId;

              if (chainId && toHex(chainId, { addPrefix: true, isStringNumber: true }) !== currentNetwork.chainId) {
                throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid chainId', message.id);
              }

              const version = method === 'eth_signTypedData_v3' ? SignTypedDataVersion.V3 : SignTypedDataVersion.V4;

              signTypedData(Buffer.from(PRIVATE_KEY_FOR_TEST, 'hex'), param2, version);
            } catch (err) {
              if (err instanceof EthereumRPCError) {
                throw err;
              }

              throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid data', message.id);
            }

            localQueues.push({
              ...request,
              message: { ...request.message, method, params: [...validatedParams] as EthSignTypedData['params'] },
            });
            void setQueues();
          } catch (err) {
            if (err instanceof EthereumRPCError) {
              throw err;
            }

            throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, message.id);
          }
        }

        if (method === 'personal_sign') {
          const { params } = message;

          const schema = personalSignParamsSchema();

          try {
            const reorderedParams = (() => {
              if (currentAccountAllowedOrigins.includes(origin) && currentPassword) {
                const keyPair = getKeyPair(currentAccount, chain, currentPassword);
                const address = getAddress(chain, keyPair?.publicKey);

                const updatedParams = params.some((item, index) => isEqualsIgnoringCase(item, address) && index !== 1) ? [params[1], params[0]] : params;

                if ((currentAccount.type === 'LEDGER' && currentAccount.ethereumPublicKey) || currentAccount.type !== 'LEDGER') {
                  if (address.toLowerCase() !== updatedParams[1].toLowerCase()) {
                    throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid address', message.id);
                  }
                }

                return updatedParams;
              }
              return [];
            })();

            const validatedParams = (await schema.validateAsync(reorderedParams)) as PersonalSign['params'];

            localQueues.push({
              ...request,
              message: { ...request.message, method, params: [...validatedParams] as PersonalSign['params'] },
            });
            void setQueues();
          } catch (err) {
            if (err instanceof EthereumRPCError) {
              throw err;
            }

            throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, message.id);
          }
        }

        if (method === 'eth_signTransaction' || method === 'eth_sendTransaction') {
          const { params } = message;

          const schema = ethSignTransactionParamsSchema();

          try {
            const validatedParams = (await schema.validateAsync(params)) as EthSignTransaction['params'];

            if (currentAccountAllowedOrigins.includes(origin) && currentPassword) {
              const keyPair = getKeyPair(currentAccount, chain, currentPassword);

              const address = getAddress(chain, keyPair?.publicKey);

              if ((currentAccount.type === 'LEDGER' && currentAccount.ethereumPublicKey) || currentAccount.type !== 'LEDGER') {
                if (address.toLowerCase() !== toHex(validatedParams[0].from, { addPrefix: true }).toLowerCase()) {
                  throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid address', message.id);
                }
              }
            }

            const originEthereumTx = validatedParams[0];

            const nonce = originEthereumTx.nonce !== undefined ? parseInt(toHex(originEthereumTx.nonce), 16) : undefined;

            let gas: string | number = 0;

            try {
              const provider = new Web3.providers.HttpProvider(currentEthereumNetwork.rpcURL, {
                headers: [
                  {
                    name: 'Cosmostation',
                    value: `extension/${String(process.env.VERSION)}`,
                  },
                ],
              });
              const web3 = new Web3(provider);

              gas = validatedParams[0].gas ? validatedParams[0].gas : await web3.eth.estimateGas({ ...validatedParams[0], nonce });
            } catch (e) {
              throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, (e as { message: string }).message, message.id);
            }

            localQueues.push({
              ...request,
              message: { ...request.message, method, params: [{ ...validatedParams[0], gas }] as EthSignTransaction['params'] },
            });
            void setQueues();
          } catch (err) {
            if (err instanceof EthereumRPCError) {
              throw err;
            }

            throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, message.id);
          }
        }

        if (method === 'eth_requestAccounts' || method === 'wallet_requestPermissions') {
          if (
            currentAccountAllowedOrigins.includes(origin) &&
            currentPassword &&
            (currentAccount.type !== 'LEDGER' || (currentAccount.type === 'LEDGER' && currentAccount.ethereumPublicKey))
          ) {
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
          } else {
            localQueues.push({ ...request, message: { ...request.message, method } });
            void setQueues();
          }
        }

        if (method === 'ethc_addNetwork') {
          const { params } = message;

          const schema = ethcAddNetworkParamsSchema();

          try {
            const validatedParams = (await schema.validateAsync(params)) as EthcAddNetwork['params'];

            const response = await ethereumRequestRPC<ResponseRPC<string>>('eth_chainId', [], message.id, validatedParams[0].rpcURL);

            if (validatedParams[0].chainId !== response.result) {
              throw new EthereumRPCError(
                RPC_ERROR.INVALID_PARAMS,
                `Chain ID returned by RPC URL ${validatedParams[0].rpcURL} does not match ${validatedParams[0].chainId}`,
                message.id,
                { chainId: response.result },
              );
            }

            if (ETHEREUM_NETWORKS.map((item) => item.chainId).includes(validatedParams[0].chainId)) {
              throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `Can't add ${validatedParams[0].chainId}`, message.id, { chainId: response.result });
            }

            localQueues.push({
              ...request,
              message: { ...request.message, method, params: [...validatedParams] as EthcAddNetwork['params'] },
            });
            void setQueues();
          } catch (err) {
            if (err instanceof EthereumRPCError) {
              throw err;
            }

            throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, message.id);
          }
        }

        if (method === 'ethc_switchNetwork') {
          const { params } = message;

          const networkChainIds = [...ETHEREUM_NETWORKS, ...additionalEthereumNetworks].map((item) => item.chainId);

          const schema = ethcSwitchNetworkParamsSchema(networkChainIds);

          try {
            const validatedParams = (await schema.validateAsync(params)) as EthcSwitchNetwork['params'];

            if (params[0] === currentEthereumNetwork.chainId) {
              const result: EthcSwitchNetworkResponse = null;

              responseToWeb({
                response: {
                  result,
                },
                message,
                messageId,
                origin,
              });

              return;
            }

            localQueues.push({
              ...request,
              message: { ...request.message, method, params: [...validatedParams] as EthcSwitchNetwork['params'] },
            });
            void setQueues();
          } catch (err) {
            if (err instanceof EthereumRPCError) {
              throw err;
            }

            throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, message.id);
          }
        }

        if (method === 'ethc_addTokens') {
          const { params } = message;

          const schema = ethcAddTokensParamsSchema();

          try {
            const validatedParams = (await schema.validateAsync(params)) as EthcAddTokens['params'];

            localQueues.push({
              ...request,
              message: { ...request.message, method, params: [...validatedParams] as EthcAddTokens['params'] },
            });
            void setQueues();
          } catch (err) {
            if (err instanceof EthereumRPCError) {
              throw err;
            }

            throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, message.id);
          }
        }

        if (method === 'wallet_watchAsset') {
          const { params } = message;

          const schema = WalletWatchAssetParamsSchema();

          try {
            const validatedParams = (await schema.validateAsync(params)) as WalletWatchAsset['params'];

            const imageURL = (() => {
              if (typeof validatedParams.options.image === 'string') return validatedParams.options.image;

              if (Array.isArray(validatedParams.options.image) && (validatedParams.options.image as string[]).length > 0) {
                const firstImage = validatedParams.options.image[0] as unknown;

                return typeof firstImage === 'string' ? firstImage : undefined;
              }

              return undefined;
            })();

            const addTokenParam: EthcAddTokens['params'][0] = {
              tokenType: validatedParams.type as typeof TOKEN_TYPE.ERC20,
              address: validatedParams.options.address,
              decimals: validatedParams.options.decimals,
              displayDenom: validatedParams.options.symbol,
              imageURL,
              coinGeckoId: validatedParams.options.coinGeckoId,
            };

            localQueues.push({
              ...request,
              message: { ...request.message, method: 'ethc_addTokens', params: [addTokenParam] as EthcAddTokens['params'] },
            });
            void setQueues();
          } catch (err) {
            if (err instanceof EthereumRPCError) {
              throw err;
            }

            throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, message.id);
          }
        }

        if (method === 'wallet_addEthereumChain') {
          const { params } = message;

          const schema = walletAddEthereumChainParamsSchema();

          try {
            const validatedParams = (await schema.validateAsync(params)) as WalletAddEthereumChain['params'];

            const response = await ethereumRequestRPC<ResponseRPC<string>>('eth_chainId', [], message.id, validatedParams[0].rpcUrls[0]);

            if (validatedParams[0].chainId !== response.result) {
              throw new EthereumRPCError(
                RPC_ERROR.UNRECOGNIZED_CHAIN,
                `Chain ID returned by RPC URL ${validatedParams[0].rpcUrls[0]} does not match ${validatedParams[0].chainId}`,
                message.id,
                { chainId: response.result },
              );
            }

            if ([...ETHEREUM_NETWORKS, ...additionalEthereumNetworks].map((item) => item.chainId).includes(validatedParams[0].chainId)) {
              localQueues.push({
                ...request,
                message: { ...request.message, method: 'ethc_switchNetwork', params: [validatedParams[0].chainId] },
              });
            } else {
              const param = validatedParams[0];

              const addNetworkParam: EthcAddNetwork['params'][0] = {
                chainId: param.chainId,
                decimals: param.nativeCurrency.decimals,
                displayDenom: param.nativeCurrency.symbol,
                networkName: param.chainName,
                rpcURL: param.rpcUrls[0],
                explorerURL: param.blockExplorerUrls?.[0],
                imageURL: param.iconUrls?.[0],
                coinGeckoId: param.coinGeckoId,
              };

              localQueues.push({
                ...request,
                message: { ...request.message, method: 'ethc_addNetwork', params: [addNetworkParam] as EthcAddNetwork['params'] },
              });
            }
            void setQueues();
          } catch (err) {
            if (err instanceof EthereumRPCError) {
              throw err;
            }

            throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, message.id);
          }
        }

        if (method === 'wallet_switchEthereumChain') {
          const { params } = message;

          const networkChainIds = [...ETHEREUM_NETWORKS, ...additionalEthereumNetworks].map((item) => item.chainId);

          const schema = walletSwitchEthereumChainParamsSchema(networkChainIds);

          try {
            const validatedParams = (await schema.validateAsync(params)) as WalletSwitchEthereumChain['params'];

            if (validatedParams[0].chainId === currentEthereumNetwork.chainId) {
              const result: WalletSwitchEthereumChainResponse = null;

              responseToWeb({
                response: {
                  result,
                },
                message,
                messageId,
                origin,
              });

              return;
            }

            localQueues.push({
              ...request,
              message: { ...request.message, method: 'ethc_switchNetwork', params: [validatedParams[0].chainId] as EthcSwitchNetwork['params'] },
            });
            void setQueues();
          } catch (err) {
            if (err instanceof EthereumRPCError) {
              throw err;
            }

            throw new EthereumRPCError(
              RPC_ERROR.UNRECOGNIZED_CHAIN,
              `Unrecognized chain ID ${params?.[0]?.chainId}. Try adding the chain using wallet_addEthereumChain first.`,
              message.id,
            );
          }
        }
      } else if (ethereumNoPopupMethods.includes(method)) {
        if (method === 'eth_accounts') {
          if (
            currentAccountAllowedOrigins.includes(origin) &&
            currentPassword &&
            (currentAccount.type !== 'LEDGER' || (currentAccount.type === 'LEDGER' && currentAccount.ethereumPublicKey))
          ) {
            const keyPair = getKeyPair(currentAccount, chain, currentPassword);
            const address = getAddress(chain, keyPair?.publicKey);

            const result: EthRequestAccountsResponse = address ? [address] : [];

            responseToWeb({
              response: {
                result,
              },
              message,
              messageId,
              origin,
            });
          } else {
            const result: EthRequestAccountsResponse = [];
            responseToWeb({
              response: {
                result,
              },
              message,
              messageId,
              origin,
            });
          }
        } else if (method === 'eth_coinbase') {
          if (
            currentAccountAllowedOrigins.includes(origin) &&
            currentPassword &&
            (currentAccount.type !== 'LEDGER' || (currentAccount.type === 'LEDGER' && currentAccount.ethereumPublicKey))
          ) {
            const keyPair = getKeyPair(currentAccount, chain, currentPassword);
            const address = getAddress(chain, keyPair?.publicKey);

            const result: EthCoinbaseResponse = address || null;

            responseToWeb({
              response: {
                result,
              },
              message,
              messageId,
              origin,
            });
          } else {
            const result: EthRequestAccountsResponse = [];
            responseToWeb({
              response: {
                result,
              },
              message,
              messageId,
              origin,
            });
          }
        } else if (method === 'wallet_getPermissions') {
          responseToWeb({
            response: {
              result: [],
            },
            message,
            messageId,
            origin,
          });
        } else if (method === 'eth_chainId') {
          responseToWeb({
            response: {
              result: currentEthereumNetwork.chainId,
            },
            message,
            messageId,
            origin,
          });
        } else {
          const params = method === ETHEREUM_METHOD_TYPE.ETH__GET_BALANCE && message.params.length === 1 ? [...message.params, 'latest'] : message.params;

          const response = await ethereumRequestRPC(method, params, id);
          responseToWeb({ response, message, messageId, origin });
        }
      } else {
        throw new EthereumRPCError(RPC_ERROR.INVALID_REQUEST, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_REQUEST], message.id);
      }
    } catch (e) {
      if (e instanceof EthereumRPCError) {
        responseToWeb({
          response: e.rpcMessage,
          message,
          messageId,
          origin,
        });
        return;
      }

      responseToWeb({
        response: {
          error: {
            code: RPC_ERROR.INTERNAL,
            message: `${RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL]}`,
          },
          jsonrpc: '2.0',
        },
        message,
        messageId,
        origin,
      });
    }
  }

  if (request.line === 'APTOS') {
    const chain = APTOS;

    const aptosMethods = Object.values(APTOS_METHOD_TYPE) as string[];
    const aptosPopupMethods = Object.values(APTOS_POPUP_METHOD_TYPE) as string[];
    const aptosNoPopupMethods = Object.values(APTOS_NO_POPUP_METHOD_TYPE) as string[];

    const { currentAccountAllowedOrigins, currentAccount, allowedOrigins, currentAptosNetwork } = await extensionStorage();

    const { currentPassword } = await extensionSessionStorage();

    const { message, messageId, origin } = request;

    if (currentAccount.type === 'LEDGER') {
      throw new AptosRPCError(RPC_ERROR.LEDGER_UNSUPPORTED_CHAIN, APTOS_RPC_ERROR_MESSAGE[RPC_ERROR.LEDGER_UNSUPPORTED_CHAIN]);
    }

    try {
      if (!message?.method || !aptosMethods.includes(message.method)) {
        throw new AptosRPCError(RPC_ERROR.UNSUPPORTED_METHOD, APTOS_RPC_ERROR_MESSAGE[RPC_ERROR.UNSUPPORTED_METHOD]);
      }

      const { method } = message;

      if (aptosPopupMethods.includes(method)) {
        if (method === 'aptos_connect' || method === 'aptos_account') {
          if (currentAccountAllowedOrigins.includes(origin) && currentPassword) {
            const keyPair = getKeyPair(currentAccount, chain, currentPassword);
            const address = getAddress(chain, keyPair?.publicKey);

            const result: AptosConnectResponse = { address, publicKey: `0x${keyPair?.publicKey.toString('hex') || ''}` };

            responseToWeb({
              response: {
                result,
              },
              message,
              messageId,
              origin,
            });
          } else {
            localQueues.push(request);
            void setQueues();
          }
        }

        if (method === 'aptos_signTransaction' || method === 'aptos_signAndSubmitTransaction') {
          const { params } = message;

          try {
            const schema = aptosSignTransactionSchema();

            const validatedParams = (await schema.validateAsync(params)) as AptosSignTransaction['params'];

            localQueues.push({
              ...request,
              message: { ...request.message, method, params: [...validatedParams] as AptosSignTransaction['params'] },
            });
            void setQueues();
          } catch (e) {
            if (e instanceof AptosRPCError) {
              throw e;
            }

            throw new AptosRPCError(RPC_ERROR.INVALID_PARAMS, `${e as string}`);
          }
        }

        if (method === 'aptos_signMessage') {
          const { params } = message;

          try {
            const schema = aptosSignMessageSchema();

            const validatedParams = (await schema.validateAsync(params)) as AptosSignMessage['params'];

            localQueues.push({
              ...request,
              message: { ...request.message, method, params: [...validatedParams] as AptosSignMessage['params'] },
            });
            void setQueues();
          } catch (e) {
            if (e instanceof AptosRPCError) {
              throw e;
            }

            throw new AptosRPCError(RPC_ERROR.INVALID_PARAMS, `${e as string}`);
          }
        }
      } else if (aptosNoPopupMethods.includes(method)) {
        if (method === 'aptos_isConnected') {
          const result: AptosIsConnectedResponse = !!currentAccountAllowedOrigins.includes(origin);

          responseToWeb({
            response: {
              result,
            },
            message,
            messageId,
            origin,
          });
        }

        if (method === 'aptos_disconnect') {
          const newAllowedOrigins = allowedOrigins.filter((item) => !(item.accountId === currentAccount.id && item.origin === origin));

          await setStorage('allowedOrigins', newAllowedOrigins);

          const result = null;

          responseToWeb({
            response: {
              result,
            },
            message,
            messageId,
            origin,
          });
        }

        if (method === 'aptos_network') {
          const result: AptosNetworkResponse = currentAptosNetwork.networkName;

          responseToWeb({
            response: {
              result,
            },
            message,
            messageId,
            origin,
          });
        }
      } else {
        throw new AptosRPCError(RPC_ERROR.INVALID_REQUEST, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_REQUEST]);
      }
    } catch (e) {
      if (e instanceof AptosRPCError) {
        responseToWeb({
          response: e.rpcMessage,
          message,
          messageId,
          origin,
        });
        return;
      }

      responseToWeb({
        response: {
          error: {
            code: RPC_ERROR.INTERNAL,
            message: `${RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL]}`,
          },
        },
        message,
        messageId,
        origin,
      });
    }
  }

  if (request.line === 'SUI') {
    const chain = SUI;

    const suiMethods = Object.values(SUI_METHOD_TYPE) as string[];
    const suiPopupMethods = Object.values(SUI_POPUP_METHOD_TYPE) as string[];
    const suiNoPopupMethods = Object.values(SUI_NO_POPUP_METHOD_TYPE) as string[];

    const { currentAccountAllowedOrigins, currentAccount, suiPermissions, allowedOrigins, currentSuiNetwork } = await extensionStorage();

    const { currentPassword } = await extensionSessionStorage();

    const { message, messageId, origin } = request;

    const currentAccountSuiPermissions =
      suiPermissions
        ?.filter((permission) => permission.accountId === currentAccount.id && permission.origin === origin)
        .map((permission) => permission.permission) || [];

    try {
      if (!message?.method || !suiMethods.includes(message.method)) {
        throw new SuiRPCError(RPC_ERROR.UNSUPPORTED_METHOD, SUI_RPC_ERROR_MESSAGE[RPC_ERROR.UNSUPPORTED_METHOD], message?.id);
      }

      const { method, id } = message;

      if (suiPopupMethods.includes(method)) {
        if (method === 'sui_connect') {
          const { params } = message;

          try {
            const schema = suiConnectSchema();

            const validatedParams = (await schema.validateAsync(params)) as SuiConnect['params'];

            if (currentAccountAllowedOrigins.includes(origin) && validatedParams.every((item) => currentAccountSuiPermissions.includes(item))) {
              const result: SuiConnectResponse = null;

              responseToWeb({
                response: {
                  result,
                },
                message,
                messageId,
                origin,
              });
            } else {
              localQueues.push({
                ...request,
                message: { ...request.message, method, params: Array.from(new Set([...validatedParams])) },
              });
              void setQueues();
            }
          } catch (e) {
            if (e instanceof SuiRPCError) {
              throw e;
            }

            throw new SuiRPCError(RPC_ERROR.INVALID_PARAMS, `${e as string}`, id);
          }
        }

        if (method === 'sui_getAccount') {
          try {
            if (currentAccountAllowedOrigins.includes(origin) && currentAccountSuiPermissions.includes('viewAccount')) {
              if (currentPassword) {
                const keyPair = getKeyPair(currentAccount, chain, currentPassword);
                const address = getAddress(chain, keyPair?.publicKey);

                const publicKey = `0x${keyPair?.publicKey.toString('hex') || ''}`;
                const result: SuiGetAccountResponse = {
                  address,
                  publicKey,
                };

                responseToWeb({
                  response: {
                    result,
                  },
                  message,
                  messageId,
                  origin,
                });
              } else {
                localQueues.push(request);
                void setQueues();
              }
            } else {
              throw new SuiRPCError(RPC_ERROR.UNAUTHORIZED, SUI_RPC_ERROR_MESSAGE[RPC_ERROR.UNAUTHORIZED], id);
            }
          } catch (e) {
            if (e instanceof SuiRPCError) {
              throw e;
            }

            throw new SuiRPCError(RPC_ERROR.INVALID_PARAMS, `${e as string}`, id);
          }
        }

        if (method === 'sui_signMessage' || method === 'sui_signPersonalMessage') {
          const { params } = message;

          try {
            if (
              currentAccountAllowedOrigins.includes(origin) &&
              currentAccountSuiPermissions.includes('viewAccount') &&
              currentAccountSuiPermissions.includes('suggestTransactions') &&
              currentPassword
            ) {
              const keyPair = getKeyPair(currentAccount, chain, currentPassword);
              const address = getAddress(chain, keyPair?.publicKey);

              if (!isEqualsIgnoringCase(address, params.accountAddress)) {
                throw new SuiRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid address', id);
              }

              const schema = suiSignMessageSchema();

              const validatedParams = (await schema.validateAsync(params)) as SuiSignMessage['params'];

              localQueues.push({
                ...request,
                message: { ...request.message, method, params: validatedParams },
              });
              void setQueues();
            } else {
              throw new SuiRPCError(RPC_ERROR.UNAUTHORIZED, SUI_RPC_ERROR_MESSAGE[RPC_ERROR.UNAUTHORIZED], id);
            }
          } catch (e) {
            if (e instanceof SuiRPCError) {
              throw e;
            }

            throw new SuiRPCError(RPC_ERROR.INVALID_PARAMS, `${e as string}`, id);
          }
        }

        if (method === 'sui_signTransactionBlock' || method === 'sui_signTransaction') {
          if (
            currentAccountAllowedOrigins.includes(origin) &&
            currentAccountSuiPermissions.includes('viewAccount') &&
            currentAccountSuiPermissions.includes('suggestTransactions')
          ) {
            localQueues.push(request);
            void setQueues();
          } else {
            throw new SuiRPCError(RPC_ERROR.UNAUTHORIZED, SUI_RPC_ERROR_MESSAGE[RPC_ERROR.UNAUTHORIZED], id);
          }
        }

        if (method === 'sui_signAndExecuteTransactionBlock' || method === 'sui_signAndExecuteTransaction') {
          if (
            currentAccountAllowedOrigins.includes(origin) &&
            currentAccountSuiPermissions.includes('viewAccount') &&
            currentAccountSuiPermissions.includes('suggestTransactions')
          ) {
            localQueues.push(request);
            void setQueues();
          } else {
            throw new SuiRPCError(RPC_ERROR.UNAUTHORIZED, SUI_RPC_ERROR_MESSAGE[RPC_ERROR.UNAUTHORIZED], id);
          }
        }
      } else if (suiNoPopupMethods.includes(method)) {
        if (method === 'sui_getPermissions') {
          responseToWeb({
            response: {
              result: currentAccountSuiPermissions,
            },
            message,
            messageId,
            origin,
          });
        } else if (method === 'sui_disconnect') {
          const newAllowedOrigins = allowedOrigins.filter((item) => !(item.accountId === currentAccount.id && item.origin === origin));
          await setStorage('allowedOrigins', newAllowedOrigins);

          const newSuiPermissions = suiPermissions.filter((permission) => !(permission.accountId === currentAccount.id && permission.origin === origin));
          await setStorage('suiPermissions', newSuiPermissions);

          const result = null;

          responseToWeb({
            response: {
              result,
            },
            message,
            messageId,
            origin,
          });
        } else if (method === 'sui_getChain') {
          const result: SuiGetChainResponse = currentSuiNetwork.networkName.toLowerCase();

          responseToWeb({
            response: {
              result,
            },
            message,
            messageId,
            origin,
          });
        } else {
          const { params } = message;

          const response = await suiRequestRPC(method, params, id);
          responseToWeb({ response, message, messageId, origin });
        }
      } else {
        throw new SuiRPCError(RPC_ERROR.INVALID_REQUEST, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_REQUEST], message.id);
      }
    } catch (e) {
      if (e instanceof SuiRPCError) {
        responseToWeb({
          response: e.rpcMessage,
          message,
          messageId,
          origin,
        });
        return;
      }

      responseToWeb({
        response: {
          error: {
            code: RPC_ERROR.INTERNAL,
            message: `${RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL]}`,
          },
          jsonrpc: '2.0',
        },
        message,
        messageId,
        origin,
      });
    }
  }
}
