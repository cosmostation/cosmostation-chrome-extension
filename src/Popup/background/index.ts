import '~/Popup/i18n/background';

import Web3 from 'web3';
import type { MessageTypes, TypedMessage } from '@metamask/eth-sig-util';
import { signTypedData, SignTypedDataVersion } from '@metamask/eth-sig-util';

import { ETHEREUM_NETWORKS, TENDERMINT_CHAINS } from '~/constants/chain';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { COSMOS } from '~/constants/chain/tendermint/cosmos';
import { PRIVATE_KEY_FOR_TEST } from '~/constants/common';
import { ETHEREUM_RPC_ERROR_MESSAGE, RPC_ERROR, RPC_ERROR_MESSAGE, TENDERMINT_RPC_ERROR_MESSAGE } from '~/constants/error';
import type { TOKEN_TYPE } from '~/constants/ethereum';
import { ETHEREUM_METHOD_TYPE, ETHEREUM_NO_POPUP_METHOD_TYPE, ETHEREUM_POPUP_METHOD_TYPE } from '~/constants/ethereum';
import { MESSAGE_TYPE } from '~/constants/message';
import { PATH } from '~/constants/route';
import { TENDERMINT_METHOD_TYPE, TENDERMINT_NO_POPUP_METHOD_TYPE, TENDERMINT_POPUP_METHOD_TYPE } from '~/constants/tendermint';
import { chromeStorage, getStorage, setStorage } from '~/Popup/utils/chromeStorage';
import { openTab } from '~/Popup/utils/chromeTabs';
import { closeWindow, openWindow } from '~/Popup/utils/chromeWindows';
import { getAddress, getKeyPair, toHex } from '~/Popup/utils/common';
import { EthereumRPCError, TendermintRPCError } from '~/Popup/utils/error';
import { requestRPC } from '~/Popup/utils/ethereum';
import { responseToWeb } from '~/Popup/utils/message';
import type { TendermintChain } from '~/types/chain';
import type { CurrencyType, LanguageType, Queue } from '~/types/chromeStorage';
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
import type { TenAccountResponse, TenAddChainParams, TenRequestAccountResponse, TenSignAminoParams, TenSignDirectParams } from '~/types/tendermint/message';
import type { ThemeType } from '~/types/theme';

import {
  ethcAddNetworkParamsSchema,
  ethcAddTokensParamsSchema,
  ethcSwitchNetworkParamsSchema,
  ethSignParamsSchema,
  ethSignTransactionParamsSchema,
  ethSignTypedDataParamsSchema,
  personalSignParamsSchema,
  tenAddChainParamsSchema,
  tenSignAminoParamsSchema,
  tenSignDirectParamsSchema,
  walletAddEthereumChainParamsSchema,
  walletSwitchEthereumChainParamsSchema,
  WalletWatchAssetParamsSchema,
} from './joiSchema';

function background() {
  chrome.runtime.onMessage.addListener((request: ContentScriptToBackgroundEventMessage<RequestMessage>, _, sendResponse) => {
    sendResponse();

    if (request?.type === MESSAGE_TYPE.REQUEST__CONTENT_SCRIPT_TO_BACKGROUND) {
      void (async () => {
        if (request.line === 'TENDERMINT') {
          const tendermintMethods = Object.values(TENDERMINT_METHOD_TYPE) as string[];
          const tendermintPopupMethods = Object.values(TENDERMINT_POPUP_METHOD_TYPE) as string[];
          const tendermintNoPopupMethods = Object.values(TENDERMINT_NO_POPUP_METHOD_TYPE) as string[];

          const { message, messageId, origin } = request;

          try {
            if (!message?.method || !tendermintMethods.includes(message.method)) {
              throw new TendermintRPCError(RPC_ERROR.METHOD_NOT_SUPPORTED, RPC_ERROR_MESSAGE[RPC_ERROR.METHOD_NOT_SUPPORTED]);
            }

            const { method } = message;

            const { currentAccount, currentAccountName, additionalChains, queues, currentAllowedChains, currentAccountAllowedOrigins, password, accounts } =
              await chromeStorage();

            if (accounts.length === 0) {
              throw new TendermintRPCError(RPC_ERROR.INVALID_REQUEST, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_REQUEST]);
            }

            const tendermintAdditionalChains = additionalChains.filter((item) => item.line === 'TENDERMINT') as TendermintChain[];

            const allChains = [...TENDERMINT_CHAINS, ...tendermintAdditionalChains];
            const allChainLowercaseNames = allChains.map((item) => item.chainName.toLowerCase());

            const getChain = (chainName?: string) => allChains.find((item) => item.chainName.toLowerCase() === chainName?.toLowerCase());

            if (tendermintPopupMethods.includes(method)) {
              if (method === 'ten_requestAccount') {
                const { params } = message;

                const selectedChain = allChains.filter((item) => item.chainId === params?.chainName);

                const chainName = selectedChain.length === 1 ? selectedChain[0].chainName.toLowerCase() : params?.chainName?.toLowerCase();

                if (!allChainLowercaseNames.includes(chainName)) {
                  throw new TendermintRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
                }

                const chain = getChain(chainName)!;

                if (
                  chain?.id &&
                  [...currentAllowedChains, ...additionalChains].map((item) => item.id).includes(chain?.id) &&
                  currentAccountAllowedOrigins.includes(origin) &&
                  password
                ) {
                  const keyPair = getKeyPair(currentAccount, chain, password);
                  const address = getAddress(chain, keyPair?.publicKey);

                  const publicKey = keyPair?.publicKey.toString('hex');

                  const result: TenRequestAccountResponse = { address, publicKey: publicKey as unknown as Uint8Array, name: currentAccountName };

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

              if (method === 'ten_addChain') {
                const { params } = message;

                const tendermintLowercaseChainNames = TENDERMINT_CHAINS.map((item) => item.chainName.toLowerCase());
                const officialTendermintLowercaseChainIds = TENDERMINT_CHAINS.map((item) => item.chainId.toLowerCase());
                const unofficialTendermintLowercaseChainIds = tendermintAdditionalChains.map((item) => item.chainId.toLowerCase());

                const schema = tenAddChainParamsSchema(
                  tendermintLowercaseChainNames,
                  officialTendermintLowercaseChainIds,
                  unofficialTendermintLowercaseChainIds,
                );

                try {
                  const validatedParams = (await schema.validateAsync(params)) as TenAddChainParams;

                  const filteredTendermintLowercaseChainIds = tendermintAdditionalChains
                    .filter((item) => item.chainName.toLowerCase() !== validatedParams.chainName)
                    .map((item) => item.chainId.toLowerCase());

                  if (filteredTendermintLowercaseChainIds.includes(validatedParams.chainId)) {
                    throw new TendermintRPCError(RPC_ERROR.INVALID_PARAMS, `${RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]}: 'chainId' is a duplicate`);
                  }

                  const window = await openWindow();
                  await setStorage('queues', [
                    ...queues,
                    {
                      ...request,
                      message: { ...request.message, method, params: { ...validatedParams, chainName: params.chainName } as TenAddChainParams },
                      windowId: window?.id,
                    },
                  ]);
                } catch (err) {
                  if (err instanceof TendermintRPCError) {
                    throw err;
                  }

                  throw new TendermintRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
                }
              }

              if (method === 'ten_signAmino') {
                const { params } = message;

                const selectedChain = allChains.filter((item) => item.chainId === params?.chainName);

                const chainName = selectedChain.length === 1 ? selectedChain[0].chainName : params?.chainName;

                const chain = getChain(chainName);

                const schema = tenSignAminoParamsSchema(allChainLowercaseNames, chain ? chain.chainId : '');

                try {
                  const validatedParams = (await schema.validateAsync({ ...params, chainName })) as TenSignAminoParams;

                  const window = await openWindow();
                  await setStorage('queues', [
                    ...queues,
                    {
                      ...request,
                      message: { ...request.message, method, params: { ...validatedParams, chainName: chain?.chainName } as TenSignAminoParams },
                      windowId: window?.id,
                    },
                  ]);
                } catch (err) {
                  throw new TendermintRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
                }
              }

              if (method === 'ten_signDirect') {
                const { params } = message;

                const selectedChain = allChains.filter((item) => item.chainId === params?.chainName);

                const chainName = selectedChain.length === 1 ? selectedChain[0].chainName : params?.chainName;

                const chain = getChain(chainName);

                const schema = tenSignDirectParamsSchema(allChainLowercaseNames, chain ? chain.chainId : '');

                try {
                  const validatedParams = (await schema.validateAsync({ ...params, chainName })) as TenSignDirectParams;

                  const window = await openWindow();
                  await setStorage('queues', [
                    ...queues,
                    {
                      ...request,
                      message: { ...request.message, method, params: { ...validatedParams, chainName: chain?.chainName } as TenSignDirectParams },
                      windowId: window?.id,
                    },
                  ]);
                } catch (err) {
                  throw new TendermintRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`);
                }
              }
            } else if (tendermintNoPopupMethods.includes(message.method)) {
              if (method === 'ten_supportedChainNames') {
                const official = TENDERMINT_CHAINS.map((item) => item.chainName.toLowerCase());

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

              if (method === 'ten_account') {
                const { params } = message;

                const selectedChain = allChains.filter((item) => item.chainId === params?.chainName);

                const chainName = selectedChain.length === 1 ? selectedChain[0].chainName.toLowerCase() : params?.chainName?.toLowerCase();

                if (!allChainLowercaseNames.includes(chainName)) {
                  throw new TendermintRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
                }

                const chain = getChain(chainName);

                if (
                  chain?.id &&
                  [...currentAllowedChains, ...additionalChains].map((item) => item.id).includes(chain?.id) &&
                  currentAccountAllowedOrigins.includes(origin) &&
                  password
                ) {
                  const keyPair = getKeyPair(currentAccount, chain, password);
                  const address = getAddress(chain, keyPair?.publicKey);

                  const publicKey = keyPair?.publicKey.toString('hex');

                  const result: TenAccountResponse = { address, publicKey: publicKey as unknown as Uint8Array, name: currentAccountName };

                  responseToWeb({
                    response: {
                      result,
                    },
                    message,
                    messageId,
                    origin,
                  });
                } else {
                  if (!currentAccountAllowedOrigins.includes(origin) || !password) {
                    throw new TendermintRPCError(RPC_ERROR.UNAUTHORIZED, TENDERMINT_RPC_ERROR_MESSAGE[RPC_ERROR.UNAUTHORIZED]);
                  }

                  throw new TendermintRPCError(RPC_ERROR.INVALID_INPUT, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_INPUT]);
                }
              }
            } else {
              throw new TendermintRPCError(RPC_ERROR.INVALID_REQUEST, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_REQUEST]);
            }
          } catch (e) {
            if (e instanceof TendermintRPCError) {
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

          const { queues, additionalEthereumNetworks, currentEthereumNetwork, password, currentAccountAllowedOrigins, currentAllowedChains, currentAccount } =
            await chromeStorage();

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

                  if (currentAllowedChains.find((item) => item.id === chain.id) && currentAccountAllowedOrigins.includes(origin) && password) {
                    const keyPair = getKeyPair(currentAccount, chain, password);
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

                  if (currentAllowedChains.find((item) => item.id === chain.id) && currentAccountAllowedOrigins.includes(origin) && password) {
                    const keyPair = getKeyPair(currentAccount, chain, password);
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

                  if (currentAllowedChains.find((item) => item.id === chain.id) && currentAccountAllowedOrigins.includes(origin) && password) {
                    const keyPair = getKeyPair(currentAccount, chain, password);
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

                  if (currentAllowedChains.find((item) => item.id === chain.id) && currentAccountAllowedOrigins.includes(origin) && password) {
                    const keyPair = getKeyPair(currentAccount, chain, password);

                    const address = getAddress(chain, keyPair?.publicKey);

                    if (address.toLowerCase() !== validatedParams[0].from) {
                      throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid address', message.id);
                    }
                  }

                  const originEthereumTx = validatedParams[0];

                  const nonce = originEthereumTx.nonce !== undefined ? parseInt(toHex(originEthereumTx.nonce), 16) : undefined;
                  const chainId = originEthereumTx.chainId !== undefined ? parseInt(toHex(originEthereumTx.chainId), 16) : undefined;

                  try {
                    const web3 = new Web3(currentEthereumNetwork().rpcURL);

                    const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY_FOR_TEST);

                    await account.signTransaction({ ...validatedParams[0], nonce, chainId });
                  } catch (e) {
                    throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, (e as { message: string }).message, message.id);
                  }

                  const window = await openWindow();
                  await setStorage('queues', [
                    ...queues,
                    {
                      ...request,
                      message: { ...request.message, method, params: [...validatedParams] as EthSignTransactionParams },
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
                if (currentAllowedChains.find((item) => item.id === chain.id) && currentAccountAllowedOrigins.includes(origin) && password) {
                  const keyPair = getKeyPair(currentAccount, chain, password);
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

              // const keyPair = getPairKey('ethereum', password);

              // if (method === ETHEREUM_POPUP_METHOD_TYPE.ETH__SIGN) {
              //   const { params } = message;

              //   if (params?.[0].toLowerCase() !== getAddress(keyPair.publicKey).toLowerCase()) {
              //     throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${ETHEREUM_RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]} (must provide an Account address.)`, id);
              //   }

              //   const dataToSign = params?.[1] ? stripHexPrefix(params[1].startsWith('0x') ? params[1] : Buffer.from(params[1]).toString('hex')) : undefined;

              //   if (!dataToSign) {
              //     throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${ETHEREUM_RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]} (must provide data to sign)`, id);
              //   }

              //   if (dataToSign.length < 66 || dataToSign.length > 67) {
              //     throw new EthereumRPCError(
              //       RPC_ERROR.INVALID_PARAMS,
              //       `${ETHEREUM_RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]} (eth_sign requires 32 byte message hash)`,
              //       id,
              //     );
              //   }

              //   responseToWeb({
              //     message: rpcResponse(sign(dataToSign, keyPair.privateKey), id),
              //     messageId,
              //     origin,
              //   });
              // } else if (method === ETHEREUM_POPUP_METHOD_TYPE.PERSONAL_SIGN) {
              //   const { params } = message;

              //   if (params?.[1].toLowerCase() !== getAddress(keyPair.publicKey).toLowerCase()) {
              //     throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${ETHEREUM_RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]} (must provide an Account address.)`, id);
              //   }

              //   if (!params?.[0]) {
              //     throw new EthereumRPCError(RPC_ERROR.INVALID_PARAMS, `${ETHEREUM_RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]} (must provide data to sign)`, id);
              //   }

              //   responseToWeb({
              //     message: rpcResponse(personalSign(params[0], keyPair.privateKey), id),
              //     messageId,
              //     origin,
              //   });
              // } else if (method === ETHEREUM_POPUP_METHOD_TYPE.ETH__SEND_TRANSACTION) {
              //   const { params } = message;

              // }
            } else if (ethereumNoPopupMethods.includes(method)) {
              if (method === 'eth_accounts') {
                if (currentAllowedChains.find((item) => item.id === chain.id) && currentAccountAllowedOrigins.includes(origin) && password) {
                  const keyPair = getKeyPair(currentAccount, chain, password);
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
      })();
    }
  });

  chrome.storage.onChanged.addListener((changes) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, { newValue }] of Object.entries(changes)) {
      if (key === 'queues') {
        const newQueues = newValue as Queue[] | undefined;
        const text = newQueues ? `${newQueues.length > 0 ? newQueues.length : ''}` : '';
        void chrome.action.setBadgeText({ text });
      }

      if (key === 'theme') {
        const newTheme = newValue as ThemeType;
        void chrome.action.setIcon({ path: newTheme === 'LIGHT' ? '/icon128.png' : '/icon128-dark.png' });
      }
    }
  });

  chrome.windows.onRemoved.addListener((windowId) => {
    void (async () => {
      const queues = await getStorage('queues');

      const currentWindowIds = queues.filter((item) => typeof item.windowId === 'number').map((item) => item.windowId) as number[];

      const currentWindowId = await getStorage('windowId');

      if (typeof currentWindowId === 'number') {
        currentWindowIds.push(currentWindowId);
      }

      const windowIds = Array.from(new Set(currentWindowIds));

      await setStorage('windowId', null);

      if (windowIds.includes(windowId)) {
        queues.forEach((queue) => {
          responseToWeb({
            response: {
              error: {
                code: RPC_ERROR.USER_REJECTED_REQUEST,
                message: `${RPC_ERROR_MESSAGE[RPC_ERROR.USER_REJECTED_REQUEST]}`,
              },
            },
            message: queue.message,
            messageId: queue.messageId,
            origin: queue.origin,
          });

          void closeWindow(queue.windowId);
        });

        await setStorage('queues', []);
      }
    })();
  });

  chrome.runtime.onStartup.addListener(() => {
    void (async () => {
      await setStorage('queues', []);
      await setStorage('windowId', null);
      await setStorage('password', null);
    })();
  });

  chrome.runtime.onInstalled.addListener((details) => {
    void (async () => {
      if (details.reason === 'install') {
        await setStorage('queues', []);
        await setStorage('windowId', null);
        await setStorage('accounts', []);
        await setStorage('accountName', {});
        await setStorage('additionalChains', []);
        await setStorage('additionalEthereumNetworks', []);
        await setStorage('ethereumTokens', []);
        await setStorage('encryptedPassword', null);
        await setStorage('selectedAccountId', '');

        await setStorage('addressBook', []);

        await setStorage('theme', '' as ThemeType);

        await setStorage('rootPath', PATH.DASHBOARD);

        await setStorage('language', '' as LanguageType);
        await setStorage('currency', '' as CurrencyType);

        await setStorage('allowedChainIds', [ETHEREUM.id, COSMOS.id]);
        await setStorage('allowedOrigins', []);
        await setStorage('selectedChainId', '');
        await setStorage('selectedEthereumNetworkId', ETHEREUM_NETWORKS[0].id);

        await setStorage('password', null);
        await openTab();
      }
    })();
  });

  void chrome.action.setBadgeBackgroundColor({ color: '#7C4FFC' });
  void chrome.action.setBadgeText({ text: '' });
}

background();
