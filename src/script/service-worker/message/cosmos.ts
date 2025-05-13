import encHex from 'crypto-js/enc-hex';
import sha256 from 'crypto-js/sha256';
import { keccak256 } from 'ethers/crypto';
import { produce } from 'immer';
import sortKeys from 'sort-keys';
import ecc from '@bitcoinerlab/secp256k1';

import { COSMOS_METHOD_TYPE } from '@/constants/cosmos/message';
import { COSMOS_RPC_ERROR_MESSAGE, RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { getAddress, getKeypair } from '@/libs/address';
import { getAddedCustomChains, getChains } from '@/libs/chain';
import { sendMessage } from '@/libs/extension';
import type { CosmosCw20Asset } from '@/types/asset';
import type { CW20BalanceResponse, CW20TokenInfoResponse } from '@/types/cosmos/contract';
import type { ResponseAppMessage } from '@/types/message/content';
import type {
  CosAccount,
  CosAccountResponse,
  CosActivatedChainIds,
  CosActivatedChainIdsResponse,
  CosActivatedChainNames,
  CosActivatedChainNamesResponse,
  CosAddNFTsCW721,
  CosAddTokensCW20Internal,
  CosmosRequest,
  CosRequestAccount,
  CosRequestAccountResponse,
  CosRequestAccountsSettled,
  CosRequestAccountsSettledResponse,
  CosRequestAddChain,
  CosSendTransaction,
  CosSendTransactionResponse,
  CosSignAmino,
  CosSignDirect,
  CosSignMessage,
  CosSupportedChainIdsResponse,
  CosSupportedChainNames,
  CosVerifyMessage,
  CosVerifyMessageResponse,
  SendTransactionPayload,
} from '@/types/message/inject/cosmos';
import { getMsgSignData } from '@/utils/cosmos/msg';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { CosmosRPCError } from '@/utils/error';
import { FetchError, get, post } from '@/utils/fetch';
import { refreshOriginConnectionTime } from '@/utils/origins';
import { processRequest } from '@/utils/requestApp';
import { extensionLocalStorage, extensionSessionStorage, setExtensionLocalStorage } from '@/utils/storage';

import {
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
} from './schema';

export async function cosmosProcess(message: CosmosRequest) {
  const { method, requestId, tabId, origin } = message;

  const { cosmosChains } = await getChains();

  const { currentAccount, currentAccountAllowedOrigins, currentAccountName, approvedOrigins, preferAccountType, currentAccountAddressInfo } =
    await extensionLocalStorage();
  const { currentPassword } = await extensionSessionStorage();

  const addedCustomChains = await getAddedCustomChains();

  const cosmosAdditionalChains = addedCustomChains.filter((chain) => chain.chainType === 'cosmos');

  const officialCosmosLowercaseChainIds = cosmosChains.map((item) => item.chainId.toLowerCase());
  const unofficialCosmosLowercaseChainIds = cosmosAdditionalChains.map((item) => item.chainId.toLowerCase());

  const cosmosLowercaseChainNames = cosmosChains.map((item) => item.name.toLowerCase());
  const unofficialCosmosLowercaseChainNames = cosmosAdditionalChains.map((item) => item.name.toLowerCase());

  const allCosmosChains = [...cosmosChains, ...cosmosAdditionalChains];
  const allChainLowercaseNames = allCosmosChains.map((item) => item.name.toLowerCase());

  const getChain = (chainName?: string) => {
    const chain = allCosmosChains.find((item) => item.name.toLowerCase() === chainName?.toLowerCase());

    if (!chain) return chain;

    const inAppSelectedPreferAccountType = preferAccountType[currentAccount.id]?.[chain.id];

    const response = inAppSelectedPreferAccountType
      ? produce(chain, (draft) => {
          draft.accountTypes = draft.accountTypes.filter(
            (item) => item.pubkeyStyle === inAppSelectedPreferAccountType?.pubkeyStyle && item.hdPath === inAppSelectedPreferAccountType?.hdPath,
          );
        })
      : chain;

    return response;
  };

  const cosmosMethods = Object.values(COSMOS_METHOD_TYPE) as string[];

  try {
    if (!message?.method || !cosmosMethods.includes(message.method)) {
      throw new CosmosRPCError(RPC_ERROR.METHOD_NOT_SUPPORTED, RPC_ERROR_MESSAGE[RPC_ERROR.METHOD_NOT_SUPPORTED]);
    }

    if (cosmosMethods.includes(method)) {
      if (method === 'cos_requestAccount') {
        const { params } = message;

        const selectedChain = allCosmosChains.filter((item) => item.chainId === params?.chainName);

        const chainName = selectedChain.length === 1 ? selectedChain[0].name.toLowerCase() : params?.chainName?.toLowerCase();

        if (!allChainLowercaseNames.includes(chainName)) {
          throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
        }

        const chain = getChain(chainName)!;

        if (chain.id && currentAccountAllowedOrigins.includes(origin) && currentPassword) {
          void refreshOriginConnectionTime(currentAccount.id, origin);

          const keyPair = getKeypair(chain, currentAccount, currentPassword);
          const address = getAddress(chain, keyPair?.publicKey);

          const publicKey = keyPair?.publicKey || '';
          const isEthermint = chain.accountTypes[0].pubkeyStyle === 'keccak256';

          const result: CosRequestAccountResponse = {
            address,
            publicKey,
            name: currentAccountName,
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
        } else {
          void processRequest({ ...message });
        }
      }

      if (method === 'cos_requestAccountsSettled') {
        const { params } = message;
        const inputChainIds = params.chainIds;

        if (currentAccountAllowedOrigins.includes(origin) && currentPassword) {
          const result: CosRequestAccountsSettledResponse = inputChainIds.map((inputChainId) => {
            const targetChain = allCosmosChains.find((chain) => chain.chainId === inputChainId);

            const chain = getChain(targetChain?.name.toLowerCase());

            if (!chain) {
              return {
                status: 'rejected',
                reason: new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]),
              };
            }

            const matchedAddressInfo = currentAccountAddressInfo.find(
              (info) => info.chainId === chain?.id && info.chainType === 'cosmos' && info.accountType.hdPath === chain.accountTypes[0].hdPath,
            );

            if (matchedAddressInfo) {
              const isEthermint = matchedAddressInfo.accountType.pubkeyStyle === 'keccak256';
              return {
                status: 'fulfilled',
                value: {
                  chainId: inputChainId,
                  address: matchedAddressInfo.address,
                  publicKey: matchedAddressInfo.publicKey,
                  name: currentAccountName,
                  isLedger: false,
                  isEthermint,
                },
              };
            }

            const keyPair = getKeypair(chain, currentAccount, currentPassword);
            const address = getAddress(chain, keyPair?.publicKey);
            const publicKey = keyPair?.publicKey || '';
            const isEthermint = chain.accountTypes[0].pubkeyStyle === 'keccak256';

            return {
              status: 'fulfilled',
              value: {
                chainId: inputChainId,
                address,
                publicKey,
                name: currentAccountName,
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
        } else {
          void processRequest({ ...message });
        }
      }

      if (method === 'cos_signAmino') {
        const { params } = message;

        const selectedChain = allCosmosChains.filter((item) => item.chainId === params?.chainName);

        const chainName = selectedChain.length === 1 ? selectedChain[0].name : params?.chainName;

        const chain = getChain(chainName);

        const schema = cosSignAminoParamsSchema(allChainLowercaseNames, chain ? chain.chainId : '');

        try {
          const validatedParams = (await schema.validateAsync({ ...params, chainName })) as CosSignAmino['params'];

          void processRequest({ ...message, params: { ...validatedParams, chainName: chain?.name } as CosSignAmino['params'] });
        } catch (err) {
          throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
        }
      }

      if (method === 'cos_signDirect') {
        const { params } = message;

        const selectedChain = allCosmosChains.filter((item) => item.chainId === params?.chainName);

        const chainName = selectedChain.length === 1 ? selectedChain[0].name : params?.chainName;

        const chain = getChain(chainName);

        const schema = cosSignDirectParamsSchema(allChainLowercaseNames, chain ? chain.chainId : '');

        try {
          const validatedParams = (await schema.validateAsync({ ...params, chainName })) as CosSignDirect['params'];

          void processRequest({ ...message, params: { ...validatedParams, chainName: chain?.name } as CosSignDirect['params'] });
        } catch (err) {
          throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
        }
      }

      if (method === 'cos_signMessage') {
        const { params } = message;

        const selectedChain = allCosmosChains.filter((item) => item.chainId === params?.chainName);

        const chainName = selectedChain.length === 1 ? selectedChain[0].name : params?.chainName;

        const chain = getChain(chainName);

        if (!chain) {
          throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
        }

        const schema = cosSignMessageParamsSchema(allChainLowercaseNames);

        try {
          const validatedParams = (await schema.validateAsync({ ...params, chainName })) as CosSignMessage['params'];

          void processRequest({ ...message, params: { ...validatedParams, chainName: chain?.name } as CosSignMessage['params'] });
        } catch (err) {
          throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
        }
      }

      if (method === 'cos_addChain') {
        const { params } = message;

        if (cosmosLowercaseChainNames.includes(params.chainName) || officialCosmosLowercaseChainIds.includes(params.chainId)) {
          sendMessage<ResponseAppMessage<CosRequestAddChain>>({
            target: 'CONTENT',
            method: 'responseApp',
            origin,
            requestId,
            tabId,
            params: {
              id: requestId,
              result: true,
            },
          });
        } else {
          try {
            const schema = cosAddChainParamsSchema(cosmosLowercaseChainNames, officialCosmosLowercaseChainIds, unofficialCosmosLowercaseChainIds);

            const validatedParams = (await schema.validateAsync(params)) as CosRequestAddChain['params'];

            const filteredCosmosLowercaseChainIds = cosmosAdditionalChains
              .filter((item) => item.name.toLowerCase() !== validatedParams.chainName)
              .map((item) => item.chainId.toLowerCase());

            if (filteredCosmosLowercaseChainIds.includes(validatedParams.chainId)) {
              sendMessage<ResponseAppMessage<CosRequestAddChain>>({
                target: 'CONTENT',
                method: 'responseApp',
                origin,
                requestId,
                tabId,
                params: {
                  id: requestId,
                  result: true,
                },
              });
              return;
            }

            void processRequest({ ...message, params: { ...validatedParams, chainName: params.chainName } as CosRequestAddChain['params'] });
          } catch (err) {
            if (err instanceof CosmosRPCError) {
              throw err;
            }

            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
          }
        }
      }

      if (method === 'cos_addTokensCW20') {
        const { params } = message;

        const cosmWasmChains = allCosmosChains.filter((item) => item.isCosmwasm);
        const cosmWasmChainLowercaseNames = cosmWasmChains.map((item) => item.name.toLowerCase());

        const selectedChain = cosmWasmChains.filter((item) => item.chainId === params?.chainName);

        const chainName = selectedChain.length === 1 ? selectedChain[0].name.toLowerCase() : params?.chainName?.toLowerCase();

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
          const uniqueTokens = params.tokens.filter((token, idx, arr) => arr.findIndex((item) => item.contractAddress === token.contractAddress) === idx);

          const requestURLs = chain.lcdUrls.map((item) => cosmosURL(item.url, chain.chainId).getCW20TokenInfo);

          const cosmosTokens = (
            await Promise.all(
              uniqueTokens.map(async (token) => {
                try {
                  const response = await Promise.any(requestURLs.map((url) => get<CW20TokenInfoResponse>(url(token.contractAddress))));
                  const result = response.data;

                  const cosmosToken: CosmosCw20Asset = {
                    type: 'cw20',
                    name: result.symbol,
                    symbol: result.symbol,
                    decimals: result.decimals,
                    image: token.imageURL,
                    id: token.contractAddress,
                    chainId: chain.id,
                    chainType: 'cosmos',
                  };

                  return cosmosToken;
                } catch {
                  return null;
                }
              }),
            )
          ).filter((item) => item !== null) as CosmosCw20Asset[];

          if (cosmosTokens.length === 0) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
          }

          void processRequest({
            ...message,
            method: 'cos_addTokensCW20Internal',
            params: { chainName: chain.name, tokens: cosmosTokens } as CosAddTokensCW20Internal['params'],
          });
        } catch (err) {
          throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
        }
      }

      if (method === 'cos_addNFTsCW721') {
        const { params } = message;

        const cosmWasmChains = allCosmosChains.filter((item) => item.isCosmwasm || item.isSupportCW721);
        const cosmWasmChainLowercaseNames = cosmWasmChains.map((item) => item.name.toLowerCase());

        const selectedChain = cosmWasmChains.filter((item) => item.chainId === params?.chainName);

        const chainName = selectedChain.length === 1 ? selectedChain[0].name.toLowerCase() : params?.chainName?.toLowerCase();

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

          void processRequest({
            ...message,
            method: 'cos_addNFTsCW721',
            params: { chainName: chain.name, nfts: cosmosNFTs } as CosAddNFTsCW721['params'],
          });
        } catch (err) {
          throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
        }
      }
      if (method === 'cos_supportedChainNames') {
        const offcial = cosmosLowercaseChainNames;
        const unofficial = cosmosAdditionalChains.map((item) => item.name.toLowerCase());

        sendMessage<ResponseAppMessage<CosSupportedChainNames>>({
          target: 'CONTENT',
          method: 'responseApp',
          origin,
          requestId,
          tabId,
          params: {
            id: requestId,
            result: { official: offcial, unofficial: unofficial },
          },
        });
      }

      if (method === 'cos_supportedChainIds') {
        const official = cosmosChains.map((item) => item.chainId);

        const unofficial = cosmosAdditionalChains.map((item) => item.chainId);

        const response: CosSupportedChainIdsResponse = { official, unofficial };

        sendMessage<ResponseAppMessage<CosSupportedChainNames>>({
          target: 'CONTENT',
          method: 'responseApp',
          origin,
          requestId,
          tabId,
          params: {
            id: requestId,
            result: response,
          },
        });
      }

      if (method === 'cos_activatedChainNames') {
        const response: CosActivatedChainNamesResponse = [...cosmosLowercaseChainNames, ...unofficialCosmosLowercaseChainNames];

        sendMessage<ResponseAppMessage<CosActivatedChainNames>>({
          target: 'CONTENT',
          method: 'responseApp',
          origin,
          requestId,
          tabId,
          params: {
            id: requestId,
            result: response,
          },
        });
      }

      if (method === 'cos_activatedChainIds') {
        const response: CosActivatedChainIdsResponse = [...cosmosChains.map((item) => item.chainId), ...cosmosAdditionalChains.map((item) => item.chainId)];

        sendMessage<ResponseAppMessage<CosActivatedChainIds>>({
          target: 'CONTENT',
          method: 'responseApp',
          origin,
          requestId,
          tabId,
          params: {
            id: requestId,
            result: response,
          },
        });
      }

      if (method === 'cos_account') {
        const { params } = message;

        const selectedChain = allCosmosChains.filter((item) => item.chainId === params?.chainName);

        const chainName = selectedChain.length === 1 ? selectedChain[0].name.toLowerCase() : params?.chainName?.toLowerCase();

        if (!allChainLowercaseNames.includes(chainName)) {
          throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
        }

        const chain = getChain(chainName);

        if (chain?.id && currentAccountAllowedOrigins.includes(origin) && currentPassword) {
          const keyPair = getKeypair(chain, currentAccount, currentPassword);
          const address = getAddress(chain, keyPair?.publicKey);

          const publicKey = keyPair?.publicKey || '';
          const isEthermint = chain.accountTypes[0].pubkeyStyle === 'keccak256';

          const result: CosAccountResponse = {
            address,
            publicKey,
            name: currentAccountName,
            isLedger: false,
            isEthermint: isEthermint,
          };

          sendMessage<ResponseAppMessage<CosAccount>>({
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
        } else {
          if (!currentAccountAllowedOrigins.includes(origin) || !currentPassword) {
            throw new CosmosRPCError(RPC_ERROR.UNAUTHORIZED, COSMOS_RPC_ERROR_MESSAGE[RPC_ERROR.UNAUTHORIZED]);
          }

          throw new CosmosRPCError(RPC_ERROR.INVALID_INPUT, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_INPUT]);
        }
      }

      if (method === 'cos_sendTransaction') {
        const { params } = message;

        const selectedChain = allCosmosChains.filter((item) => item.chainId === params?.chainName);

        const chainName = selectedChain.length === 1 ? selectedChain[0].name.toLowerCase() : params?.chainName?.toLowerCase();

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
          const response: CosSendTransactionResponse = await post<SendTransactionPayload>(`${chain.lcdUrls[0].url}/cosmos/tx/v1beta1/txs`, {
            tx_bytes: params.txBytes,
            mode: params.mode,
          });

          sendMessage<ResponseAppMessage<CosSendTransaction>>({
            target: 'CONTENT',
            method: 'responseApp',
            origin,
            requestId,
            tabId,
            params: {
              id: requestId,
              result: response,
            },
          });
        } catch (e) {
          if (e instanceof FetchError) {
            sendMessage({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id: requestId,
                error: {
                  code: RPC_ERROR.INTERNAL,
                  message: RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL],
                  data: { status: e.data.status, statusText: e.data.statusText, message: await e.data.text() },
                },
              },
            });
          } else {
            sendMessage({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id: requestId,
                error: {
                  code: RPC_ERROR.INTERNAL,
                  message: RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL],
                },
              },
            });
          }
        }
      }

      if (method === 'cos_getBalanceCW20') {
        const { params } = message;

        const cosmWasmChains = allCosmosChains.filter((item) => item.isCosmwasm);
        const cosmWasmChainLowercaseNames = cosmWasmChains.map((item) => item.name.toLowerCase());

        const selectedChain = cosmWasmChains.filter((item) => item.chainId === params?.chainName);

        const chainName = selectedChain.length === 1 ? selectedChain[0].name.toLowerCase() : params?.chainName?.toLowerCase();

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
          const { getCW20Balance } = cosmosURL(chain.lcdUrls[0].url, chain.chainId);
          const response = await get<CW20BalanceResponse>(getCW20Balance(params.contractAddress, params.address));

          const amount = response.data.balance || '0';

          sendMessage({
            target: 'CONTENT',
            method: 'responseApp',
            origin,
            requestId,
            tabId,
            params: {
              id: requestId,
              result: amount,
            },
          });
        } catch (e) {
          if (e instanceof FetchError) {
            sendMessage({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id: requestId,
                error: {
                  code: RPC_ERROR.INTERNAL,
                  message: RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL],
                  data: { status: e.data.status, statusText: e.data.statusText, message: await e.data.text() },
                },
              },
            });
          } else {
            sendMessage({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id: requestId,
                error: {
                  code: RPC_ERROR.INTERNAL,
                  message: RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL],
                },
              },
            });
          }
        }
      }

      if (method === 'cos_getTokenInfoCW20') {
        const { params } = message;

        const cosmWasmChains = allCosmosChains.filter((item) => item.isCosmwasm);
        const cosmWasmChainLowercaseNames = cosmWasmChains.map((item) => item.name.toLowerCase());

        const selectedChain = cosmWasmChains.filter((item) => item.chainId === params?.chainName);

        const chainName = selectedChain.length === 1 ? selectedChain[0].name.toLowerCase() : params?.chainName?.toLowerCase();

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
          const { getCW20TokenInfo } = cosmosURL(chain.lcdUrls[0].url, chain.chainId);
          const response = await get<CW20TokenInfoResponse>(getCW20TokenInfo(params.contractAddress));

          const result = response.data;

          sendMessage({
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
        } catch (e) {
          if (e instanceof FetchError) {
            sendMessage({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id: requestId,
                error: {
                  code: RPC_ERROR.INTERNAL,
                  message: RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL],
                  data: { status: e.data.status, statusText: e.data.statusText, message: await e.data.text() },
                },
              },
            });
          } else {
            sendMessage({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id: requestId,
                error: {
                  code: RPC_ERROR.INTERNAL,
                  message: RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL],
                },
              },
            });
          }
        }
      }

      if (method === 'cos_verifyMessage') {
        const { params } = message;

        const selectedChain = allCosmosChains.filter((item) => item.chainId === params?.chainName);

        const chainName = selectedChain.length === 1 ? selectedChain[0].name : params?.chainName;

        const chain = getChain(chainName);

        if (!chain) {
          throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
        }

        const schema = cosVerifyMessageParamsSchema(allChainLowercaseNames);

        try {
          const validatedParams = (await schema.validateAsync({ ...params, chainName })) as CosVerifyMessage['params'];

          const signDoc = JSON.stringify(sortKeys(getMsgSignData(validatedParams.signer, validatedParams.message)));

          const isEthermint = chain.accountTypes[0].pubkeyStyle === 'keccak256';

          const tx = isEthermint
            ? keccak256(Buffer.from(signDoc)).substring(2)
            : sha256(JSON.stringify(sortKeys(getMsgSignData(validatedParams.signer, validatedParams.message), { deep: true }))).toString(encHex);

          const result: CosVerifyMessageResponse = ecc.verify(
            Buffer.from(tx, 'hex'),
            Buffer.from(validatedParams.publicKey, 'base64'),
            Buffer.from(validatedParams.signature, 'base64'),
            true,
          );

          sendMessage({
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
        } catch {
          const result: CosVerifyMessageResponse = false;

          sendMessage({
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
        }
      }

      if (method === 'cos_disconnect') {
        const newApprovedOrigins = approvedOrigins.filter((item) => !(item.accountId === currentAccount.id && item.origin === origin));

        await setExtensionLocalStorage('approvedOrigins', newApprovedOrigins);

        const result = null;

        sendMessage({
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
      }
    } else {
      throw new CosmosRPCError(RPC_ERROR.INVALID_REQUEST, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_REQUEST]);
    }
  } catch (e) {
    if (e instanceof CosmosRPCError) {
      sendMessage({
        target: 'CONTENT',
        method: 'responseApp',
        origin,
        requestId,
        tabId,
        params: {
          id: requestId,
          error: e.rpcMessage.error,
        },
      });
      return;
    }

    sendMessage({
      target: 'CONTENT',
      method: 'responseApp',
      origin,
      requestId,
      tabId,
      params: {
        id: requestId,
        error: {
          code: RPC_ERROR.INTERNAL,
          message: `${RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL]}`,
        },
      },
    });
  }
}
