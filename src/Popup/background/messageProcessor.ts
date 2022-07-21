import Web3 from 'web3';
import type { MessageTypes, TypedMessage } from '@metamask/eth-sig-util';
import { signTypedData, SignTypedDataVersion } from '@metamask/eth-sig-util';

import { COSMOS_CHAINS, ETHEREUM_NETWORKS } from '~/constants/chain';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { PRIVATE_KEY_FOR_TEST } from '~/constants/common';
import { COSMOS_METHOD_TYPE, COSMOS_NO_POPUP_METHOD_TYPE, COSMOS_POPUP_METHOD_TYPE } from '~/constants/cosmos';
import { COSMOS_RPC_ERROR_MESSAGE, ETHEREUM_RPC_ERROR_MESSAGE, RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import type { TOKEN_TYPE } from '~/constants/ethereum';
import { ETHEREUM_METHOD_TYPE, ETHEREUM_NO_POPUP_METHOD_TYPE, ETHEREUM_POPUP_METHOD_TYPE } from '~/constants/ethereum';
import { chromeSessionStorage } from '~/Popup/utils/chromeSessionStorage';
import { chromeStorage, setStorage } from '~/Popup/utils/chromeStorage';
import { openWindow } from '~/Popup/utils/chromeWindows';
import { getAddress, getKeyPair, toHex } from '~/Popup/utils/common';
import { CosmosRPCError, EthereumRPCError } from '~/Popup/utils/error';
import { requestRPC } from '~/Popup/utils/ethereum';
import { responseToWeb } from '~/Popup/utils/message';
import type { CosmosChain } from '~/types/chain';
import type { SendTransactionPayload } from '~/types/cosmos/common';
import type { CosAccountResponse, CosAddChainParams, CosRequestAccountResponse, CosSignAminoParams, CosSignDirectParams } from '~/types/cosmos/message';
import type {
  EthcAddNetworkParams,
  EthcAddTokensParam,
  EthcAddTokensParams,
  EthcSwitchNetworkParams,
  EthcSwitchNetworkResponse,
  EthRequestAccountsResponse,
  EthSignParams,
  EthSignTransactionParams,
  EthSignTypedDataParams,
  PersonalSignParams,
  WalletAddEthereumChainParams,
  WalletSwitchEthereumChainParams,
  WalletSwitchEthereumChainResponse,
  WalletWatchAssetParams,
} from '~/types/ethereum/message';
import type { ResponseRPC } from '~/types/ethereum/rpc';
import type { ContentScriptToBackgroundEventMessage, RequestMessage } from '~/types/message';

import {
  cosAddChainParamsSchema,
  cosSendTransactionParamsSchema,
  cosSignAminoParamsSchema,
  cosSignDirectParamsSchema,
  ethcAddNetworkParamsSchema,
  ethcAddTokensParamsSchema,
  ethcSwitchNetworkParamsSchema,
  ethSignParamsSchema,
  ethSignTransactionParamsSchema,
  ethSignTypedDataParamsSchema,
  personalSignParamsSchema,
  walletAddEthereumChainParamsSchema,
  walletSwitchEthereumChainParamsSchema,
  WalletWatchAssetParamsSchema,
} from './joiSchema';
import { post } from '../utils/fetch';

// contentScrpit to background
export async function cstob(request: ContentScriptToBackgroundEventMessage<RequestMessage>) {
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

      const { currentAccount, currentAccountName, additionalChains, queues, currentAllowedChains, currentAccountAllowedOrigins, accounts } =
        await chromeStorage();

      const { currentPassword } = await chromeSessionStorage();

      if (accounts.length === 0) {
        throw new CosmosRPCError(RPC_ERROR.INVALID_REQUEST, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_REQUEST]);
      }

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

          if (
            chain?.id &&
            [...currentAllowedChains, ...additionalChains].map((item) => item.id).includes(chain?.id) &&
            currentAccountAllowedOrigins.includes(origin) &&
            currentPassword
          ) {
            const keyPair = getKeyPair(currentAccount, chain, currentPassword);
            const address = getAddress(chain, keyPair?.publicKey);

            const publicKey = keyPair?.publicKey.toString('hex');

            const result: CosRequestAccountResponse = { address, publicKey: publicKey as unknown as Uint8Array, name: currentAccountName };

            responseToWeb({
              response: {
                result,
              },
              message,
              messageId,
              origin,
            });
          } else {
            const window = await openWindow();
            await setStorage('queues', [
              ...queues,
              { ...request, message: { ...request.message, method, params: { chainName: chain.chainName } }, windowId: window?.id },
            ]);
          }
        }

        if (method === 'cos_addChain' || method === 'ten_addChain') {
          const { params } = message;

          const cosmosLowercaseChainNames = COSMOS_CHAINS.map((item) => item.chainName.toLowerCase());
          const officialCosmosLowercaseChainIds = COSMOS_CHAINS.map((item) => item.chainId.toLowerCase());
          const unofficialCosmosLowercaseChainIds = cosmosAdditionalChains.map((item) => item.chainId.toLowerCase());

          const schema = cosAddChainParamsSchema(cosmosLowercaseChainNames, officialCosmosLowercaseChainIds, unofficialCosmosLowercaseChainIds);

          try {
            const validatedParams = (await schema.validateAsync(params)) as CosAddChainParams;

            const filteredCosmosLowercaseChainIds = cosmosAdditionalChains
              .filter((item) => item.chainName.toLowerCase() !== validatedParams.chainName)
              .map((item) => item.chainId.toLowerCase());

            if (filteredCosmosLowercaseChainIds.includes(validatedParams.chainId)) {
              throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]}: 'chainId' is a duplicate`);
            }

            const window = await openWindow();
            await setStorage('queues', [
              ...queues,
              {
                ...request,
                message: { ...request.message, method, params: { ...validatedParams, chainName: params.chainName } as CosAddChainParams },
                windowId: window?.id,
              },
            ]);
          } catch (err) {
            if (err instanceof CosmosRPCError) {
              throw err;
            }

            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
          }
        }

        if (method === 'cos_signAmino' || method === 'ten_signAmino') {
          const { params } = message;

          const selectedChain = allChains.filter((item) => item.chainId === params?.chainName);

          const chainName = selectedChain.length === 1 ? selectedChain[0].chainName : params?.chainName;

          const chain = getChain(chainName);

          const schema = cosSignAminoParamsSchema(allChainLowercaseNames, chain ? chain.chainId : '');

          try {
            const validatedParams = (await schema.validateAsync({ ...params, chainName })) as CosSignAminoParams;

            const window = await openWindow();
            await setStorage('queues', [
              ...queues,
              {
                ...request,
                message: { ...request.message, method, params: { ...validatedParams, chainName: chain?.chainName } as CosSignAminoParams },
                windowId: window?.id,
              },
            ]);
          } catch (err) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
          }
        }

        if (method === 'cos_signDirect' || method === 'ten_signDirect') {
          const { params } = message;

          const selectedChain = allChains.filter((item) => item.chainId === params?.chainName);

          const chainName = selectedChain.length === 1 ? selectedChain[0].chainName : params?.chainName;

          const chain = getChain(chainName);

          const schema = cosSignDirectParamsSchema(allChainLowercaseNames, chain ? chain.chainId : '');

          try {
            const validatedParams = (await schema.validateAsync({ ...params, chainName })) as CosSignDirectParams;

            const window = await openWindow();
            await setStorage('queues', [
              ...queues,
              {
                ...request,
                message: { ...request.message, method, params: { ...validatedParams, chainName: chain?.chainName } as CosSignDirectParams },
                windowId: window?.id,
              },
            ]);
          } catch (err) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
          }
        }
      } else if (cosmosNoPopupMethods.includes(message.method)) {
        if (method === 'cos_supportedChainNames' || method === 'ten_supportedChainNames') {
          const official = COSMOS_CHAINS.map((item) => item.chainName.toLowerCase());

          const unofficial = additionalChains.map((item) => item.chainName.toLowerCase());

          responseToWeb({
            response: {
              result: { official, unofficial },
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

          if (
            chain?.id &&
            [...currentAllowedChains, ...additionalChains].map((item) => item.id).includes(chain?.id) &&
            currentAccountAllowedOrigins.includes(origin) &&
            currentPassword
          ) {
            const keyPair = getKeyPair(currentAccount, chain, currentPassword);
            const address = getAddress(chain, keyPair?.publicKey);

            const publicKey = keyPair?.publicKey.toString('hex');

            const result: CosAccountResponse = { address, publicKey: publicKey as unknown as Uint8Array, name: currentAccountName };

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

          const chain = getChain(chainName)!;

          const schema = cosSendTransactionParamsSchema(allChainLowercaseNames);

          try {
            await schema.validateAsync({ ...params, chainName });
          } catch (err) {
            throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
          }

          try {
            const response = await post<SendTransactionPayload>(`${chain.restURL}/cosmos/tx/v1beta1/txs`, {
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
            responseToWeb({
              response: {
                error: {
                  code: RPC_ERROR.INTERNAL,
                  message: RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL],
                  data: e,
                },
              },
              message,
              messageId,
              origin,
            });
          }
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

    const { queues, additionalEthereumNetworks, currentEthereumNetwork, currentAccountAllowedOrigins, currentAllowedChains, currentAccount } =
      await chromeStorage();

    const { currentPassword } = await chromeSessionStorage();

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
            const validatedParams = (await schema.validateAsync(params)) as EthSignParams;

            if (currentAllowedChains.find((item) => item.id === chain.id) && currentAccountAllowedOrigins.includes(origin) && currentPassword) {
              const keyPair = getKeyPair(currentAccount, chain, currentPassword);
              const address = getAddress(chain, keyPair?.publicKey);

              if (address.toLowerCase() !== validatedParams[0].toLowerCase()) {
                throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid address', message.id);
              }
            }

            const window = await openWindow();
            await setStorage('queues', [
              ...queues,
              {
                ...request,
                message: { ...request.message, method, params: [...validatedParams] as EthSignParams },
                windowId: window?.id,
              },
            ]);
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
            const validatedParams = (await schema.validateAsync(params)) as EthSignTypedDataParams;

            if (currentAllowedChains.find((item) => item.id === chain.id) && currentAccountAllowedOrigins.includes(origin) && currentPassword) {
              const keyPair = getKeyPair(currentAccount, chain, currentPassword);
              const address = getAddress(chain, keyPair?.publicKey);

              if (address.toLowerCase() !== validatedParams[0].toLowerCase()) {
                throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid address', message.id);
              }
            }

            try {
              const param2 = JSON.parse(validatedParams[1]) as TypedMessage<MessageTypes>;

              const currentNetwork = currentEthereumNetwork();

              const chainId = param2?.domain?.chainId;

              if (chainId && toHex(chainId, { addPrefix: true }) !== currentNetwork.chainId) {
                throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid chainId', message.id);
              }

              const version = method === 'eth_signTypedData_v3' ? SignTypedDataVersion.V3 : SignTypedDataVersion.V4;

              signTypedData({ version, privateKey: Buffer.from(PRIVATE_KEY_FOR_TEST, 'hex'), data: param2 });
            } catch (err) {
              if (err instanceof EthereumRPCError) {
                throw err;
              }

              throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid data', message.id);
            }

            const window = await openWindow();
            await setStorage('queues', [
              ...queues,
              {
                ...request,
                message: { ...request.message, method, params: [...validatedParams] as EthSignTypedDataParams },
                windowId: window?.id,
              },
            ]);
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
            const validatedParams = (await schema.validateAsync(params)) as PersonalSignParams;

            if (currentAllowedChains.find((item) => item.id === chain.id) && currentAccountAllowedOrigins.includes(origin) && currentPassword) {
              const keyPair = getKeyPair(currentAccount, chain, currentPassword);
              const address = getAddress(chain, keyPair?.publicKey);

              if (address.toLowerCase() !== validatedParams[1].toLowerCase()) {
                throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid address', message.id);
              }
            }

            const window = await openWindow();
            await setStorage('queues', [
              ...queues,
              {
                ...request,
                message: { ...request.message, method, params: [...validatedParams] as PersonalSignParams },
                windowId: window?.id,
              },
            ]);
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
            const validatedParams = (await schema.validateAsync(params)) as EthSignTransactionParams;

            if (currentAllowedChains.find((item) => item.id === chain.id) && currentAccountAllowedOrigins.includes(origin) && currentPassword) {
              const keyPair = getKeyPair(currentAccount, chain, currentPassword);

              const address = getAddress(chain, keyPair?.publicKey);

              if (address.toLowerCase() !== toHex(validatedParams[0].from, { addPrefix: true }).toLowerCase()) {
                throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid address', message.id);
              }
            }

            const originEthereumTx = validatedParams[0];

            const nonce = originEthereumTx.nonce !== undefined ? parseInt(toHex(originEthereumTx.nonce), 16) : undefined;
            const chainId = originEthereumTx.chainId !== undefined ? parseInt(toHex(originEthereumTx.chainId), 16) : undefined;

            let gas: string | number = 0;

            try {
              const provider = new Web3.providers.HttpProvider(currentEthereumNetwork().rpcURL, {
                headers: [
                  {
                    name: 'Cosmostation',
                    value: `extension/${String(process.env.VERSION)}`,
                  },
                ],
              });
              const web3 = new Web3(provider);

              const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY_FOR_TEST);

              gas = validatedParams[0].gas ? validatedParams[0].gas : await web3.eth.estimateGas({ ...validatedParams[0], nonce, chainId });

              await account.signTransaction({ ...validatedParams[0], nonce, chainId, gas });
            } catch (e) {
              throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, (e as { message: string }).message, message.id);
            }

            const window = await openWindow();
            await setStorage('queues', [
              ...queues,
              {
                ...request,
                message: { ...request.message, method, params: [{ ...validatedParams[0], gas }] as EthSignTransactionParams },
                windowId: window?.id,
              },
            ]);
          } catch (err) {
            if (err instanceof EthereumRPCError) {
              throw err;
            }

            throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, message.id);
          }
        }

        if (method === 'eth_requestAccounts') {
          if (currentAllowedChains.find((item) => item.id === chain.id) && currentAccountAllowedOrigins.includes(origin) && currentPassword) {
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
            const window = await openWindow();
            await setStorage('queues', [...queues, { ...request, message: { ...request.message, method }, windowId: window?.id }]);
          }
        }

        if (method === 'ethc_addNetwork') {
          const { params } = message;

          const schema = ethcAddNetworkParamsSchema();

          try {
            const validatedParams = (await schema.validateAsync(params)) as EthcAddNetworkParams;

            const response = await requestRPC<ResponseRPC<string>>('eth_chainId', [], message.id, validatedParams[0].rpcURL);

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

            const window = await openWindow();
            await setStorage('queues', [
              ...queues,
              {
                ...request,
                message: { ...request.message, method, params: [...validatedParams] as EthcAddNetworkParams },
                windowId: window?.id,
              },
            ]);
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
            const validatedParams = (await schema.validateAsync(params)) as EthcSwitchNetworkParams;

            if (params[0] === currentEthereumNetwork().chainId) {
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

            const window = await openWindow();
            await setStorage('queues', [
              ...queues,
              {
                ...request,
                message: { ...request.message, method, params: [...validatedParams] as EthcSwitchNetworkParams },
                windowId: window?.id,
              },
            ]);
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
            const validatedParams = (await schema.validateAsync(params)) as EthcAddTokensParams;

            const window = await openWindow();
            await setStorage('queues', [
              ...queues,
              {
                ...request,
                message: { ...request.message, method, params: [...validatedParams] as EthcAddTokensParams },
                windowId: window?.id,
              },
            ]);
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
            const validatedParams = (await schema.validateAsync(params)) as WalletWatchAssetParams;

            const addTokenParam: EthcAddTokensParam = {
              tokenType: validatedParams.type as typeof TOKEN_TYPE.ERC20,
              address: validatedParams.options.address,
              decimals: validatedParams.options.decimals,
              displayDenom: validatedParams.options.symbol,
              imageURL: validatedParams.options.image,
              coinGeckoId: validatedParams.options.coinGeckoId,
            };

            const window = await openWindow();

            await setStorage('queues', [
              ...queues,
              {
                ...request,
                message: { ...request.message, method: 'ethc_addTokens', params: [addTokenParam] as EthcAddTokensParams },
                windowId: window?.id,
              },
            ]);
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
            const validatedParams = (await schema.validateAsync(params)) as WalletAddEthereumChainParams;

            const response = await requestRPC<ResponseRPC<string>>('eth_chainId', [], message.id, validatedParams[0].rpcUrls[0]);

            if (validatedParams[0].chainId !== response.result) {
              throw new EthereumRPCError(
                RPC_ERROR.INVALID_PARAMS,
                `Chain ID returned by RPC URL ${validatedParams[0].rpcUrls[0]} does not match ${validatedParams[0].chainId}`,
                message.id,
                { chainId: response.result },
              );
            }

            if (ETHEREUM_NETWORKS.map((item) => item.chainId).includes(validatedParams[0].chainId)) {
              throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `Can't add ${validatedParams[0].chainId}`, message.id, { chainId: response.result });
            }

            const param = validatedParams[0];

            const addNetworkParam: EthcAddNetworkParams[0] = {
              chainId: param.chainId,
              decimals: param.nativeCurrency.decimals,
              displayDenom: param.nativeCurrency.symbol,
              networkName: param.chainName,
              rpcURL: param.rpcUrls[0],
              explorerURL: param.blockExplorerUrls?.[0],
              imageURL: param.iconUrls?.[0],
              coinGeckoId: param.coinGeckoId,
            };

            const window = await openWindow();
            await setStorage('queues', [
              ...queues,
              {
                ...request,
                message: { ...request.message, method: 'ethc_addNetwork', params: [addNetworkParam] as EthcAddNetworkParams },
                windowId: window?.id,
              },
            ]);
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
            const validatedParams = (await schema.validateAsync(params)) as WalletSwitchEthereumChainParams;

            if (validatedParams[0].chainId === currentEthereumNetwork().chainId) {
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

            const window = await openWindow();
            await setStorage('queues', [
              ...queues,
              {
                ...request,
                message: { ...request.message, method: 'ethc_switchNetwork', params: [validatedParams[0].chainId] as EthcSwitchNetworkParams },
                windowId: window?.id,
              },
            ]);
          } catch (err) {
            if (err instanceof EthereumRPCError) {
              throw err;
            }

            throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, message.id);
          }
        }
      } else if (ethereumNoPopupMethods.includes(method)) {
        if (method === 'eth_accounts') {
          if (currentAllowedChains.find((item) => item.id === chain.id) && currentAccountAllowedOrigins.includes(origin) && currentPassword) {
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
        } else {
          const params = method === ETHEREUM_METHOD_TYPE.ETH__GET_BALANCE && message.params.length === 1 ? [...message.params, 'latest'] : message.params;

          const response = await requestRPC(method, params, id);
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
}
