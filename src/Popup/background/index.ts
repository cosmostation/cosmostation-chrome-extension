import '~/Popup/i18n/background';

import { CHAINS, ETHEREUM_CHAINS, ETHEREUM_NETWORKS, TENDERMINT_CHAINS } from '~/constants/chain';
import { ETHEREUM_RPC_ERROR_MESSAGE, RPC_ERROR, RPC_ERROR_MESSAGE, TENDERMINT_RPC_ERROR_MESSAGE } from '~/constants/error';
import { ETHEREUM_METHOD_TYPE, ETHEREUM_NO_POPUP_METHOD_TYPE, ETHEREUM_POPUP_METHOD_TYPE } from '~/constants/ethereum';
import { MESSAGE_TYPE } from '~/constants/message';
import { PATH } from '~/constants/route';
import { TENDERMINT_METHOD_TYPE, TENDERMINT_NO_POPUP_METHOD_TYPE, TENDERMINT_POPUP_METHOD_TYPE } from '~/constants/tendermint';
import { getStorage, setStorage } from '~/Popup/utils/chromeStorage';
import { openTab } from '~/Popup/utils/chromeTabs';
import { closeWindow, openWindow } from '~/Popup/utils/chromeWindows';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { EthereumRPCError, TendermintRPCError } from '~/Popup/utils/error';
import { responseToWeb } from '~/Popup/utils/message';
import type { TendermintChain } from '~/types/chain';
import type { CurrencyType, LanguageType, Queue } from '~/types/chromeStorage';
import type { EthAddNetworkParams, EthcRequestAccountsResponse, EthcSwitchNetworkParams, EthcSwitchNetworkResponse } from '~/types/ethereum/message';
import type { ResponseRPC } from '~/types/ethereum/rpc';
import type { ContentScriptToBackgroundEventMessage, RequestMessage } from '~/types/message';
import type { TenAccountResponse, TenAddChainParams, TenRequestAccountResponse, TenSignAminoParams, TenSignDirectParams } from '~/types/tendermint/message';
import type { ThemeType } from '~/types/theme';

import { chromeStorage } from './chromeStorage';
import { requestRPC } from './ethereum';
import {
  ethcAddNetworkParamsSchema,
  ethcSwitchNetworkParamsSchema,
  tenAddChainParamsSchema,
  tenSignAminoParamsSchema,
  tenSignDirectParamsSchema,
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
              if (method === 'ethc_requestAccounts') {
                const chain = ETHEREUM_CHAINS[0];
                if (currentAllowedChains.find((item) => item.id === chain.id) && currentAccountAllowedOrigins.includes(origin) && password) {
                  const keyPair = getKeyPair(currentAccount, chain, password);
                  const address = getAddress(chain, keyPair?.publicKey);

                  const result: EthcRequestAccountsResponse = [address];

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
                  const validatedParams = (await schema.validateAsync(params)) as EthAddNetworkParams;

                  const response = await requestRPC<ResponseRPC<string>>('eth_chainId', [], message.id, validatedParams[0].rpcURL);

                  if (validatedParams[0].chainId !== response.result) {
                    throw new EthereumRPCError(
                      RPC_ERROR.INVALID_PARAMS,
                      `Chain ID returned by RPC URL ${validatedParams[0].rpcURL} does not match ${validatedParams[0].chainId}`,
                      message.id,
                      { chainId: response.result },
                    );
                  }

                  const window = await openWindow();
                  await setStorage('queues', [
                    ...queues,
                    {
                      ...request,
                      message: { ...request.message, method, params: [...validatedParams] as EthAddNetworkParams },
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
                const chain = ETHEREUM_CHAINS[0];
                if (currentAllowedChains.find((item) => item.id === chain.id) && currentAccountAllowedOrigins.includes(origin) && password) {
                  const keyPair = getKeyPair(currentAccount, chain, password);
                  const address = getAddress(chain, keyPair?.publicKey);

                  const result: EthcRequestAccountsResponse = [address];

                  responseToWeb({
                    response: {
                      result,
                    },
                    message,
                    messageId,
                    origin,
                  });
                } else {
                  const result: EthcRequestAccountsResponse = [];
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
        await setStorage('encryptedPassword', null);
        await setStorage('selectedAccountId', '');

        await setStorage('addressBook', []);

        await setStorage('theme', '' as ThemeType);

        await setStorage('rootPath', PATH.DASHBOARD);

        await setStorage('language', '' as LanguageType);
        await setStorage('currency', '' as CurrencyType);

        await setStorage('allowedChainIds', [CHAINS[0].id]);
        await setStorage('allowedOrigins', []);
        await setStorage('selectedChainId', '');
        await setStorage('selectedEthereumNetworkId', '');

        await setStorage('password', null);
        await openTab();
      }
    })();
  });

  void chrome.action.setBadgeBackgroundColor({ color: '#7C4FFC' });
  void chrome.action.setBadgeText({ text: '' });
}

background();
