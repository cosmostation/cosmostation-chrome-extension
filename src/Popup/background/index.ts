import '~/Popup/i18n/background';

import { ecsign, hashPersonalMessage, stripHexPrefix, toRpcSig } from 'ethereumjs-util';

import { CHAINS, TENDERMINT_CHAINS } from '~/constants/chain';
import { ETHEREUM_RPC_ERROR_MESSAGE, RPC_ERROR, RPC_ERROR_MESSAGE, TENDERMINT_RPC_ERROR_MESSAGE } from '~/constants/error';
import { ETHEREUM_METHOD_TYPE, ETHEREUM_POPUP_METHOD_TYPE } from '~/constants/ethereum';
import { MESSAGE_TYPE } from '~/constants/message';
import { PATH } from '~/constants/route';
import { TENDERMINT_METHOD_TYPE, TENDERMINT_NO_POPUP_METHOD_TYPE, TENDERMINT_POPUP_METHOD_TYPE } from '~/constants/tendermint';
import { THEME_TYPE } from '~/constants/theme';
import { getCurrentAccount, getStorage, setStorage } from '~/Popup/utils/chromeStorage';
import { openTab } from '~/Popup/utils/chromeTabs';
import { openWindow } from '~/Popup/utils/chromeWindows';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { EthereumRPCError, TendermintRPCError } from '~/Popup/utils/error';
import { responseToWeb } from '~/Popup/utils/message';
import type { TendermintChain } from '~/types/chain';
import type { CurrencyType, LanguageType } from '~/types/chromeStorage';
import type { ContentScriptToBackgroundEventMessage, RequestMessage, ResponseMessage } from '~/types/message';
import type { TenAddChainParams, TenSignAminoParams } from '~/types/tendermint/message';
import type { ThemeType } from '~/types/theme';

import { chromeStorage } from './chromeStorage';
import { determineTxType, requestRPC } from './ethereum';
import { initI18n } from './i18n';
import { tenAddChainParamsSchema, tenSignAminoParamsSchema } from './joiSchema';
import { mnemonicToPair, privateKeyToPair } from '../utils/crypto';

function background() {
  console.log('background start');

  chrome.runtime.onMessage.addListener((request: ContentScriptToBackgroundEventMessage<RequestMessage>, sender, sendResponse) => {
    console.log('content-script to background request sender', request, sender);
    sendResponse();
    console.log('진입');

    // console.log('localStorage', localStorage.getItem('i18nextLng'));

    if (request?.type === MESSAGE_TYPE.REQUEST__CONTENT_SCRIPT_TO_BACKGROUND) {
      void (async function asyncHandler() {
        // if (request.message.method === 'requestAccount') {
        //   const currentAccount = await getCurrentAccount();
        // }

        if (request.line === 'TENDERMINT') {
          const tendermintMethods = Object.values(TENDERMINT_METHOD_TYPE) as string[];
          const tendermintPopupMethods = Object.values(TENDERMINT_POPUP_METHOD_TYPE) as string[];
          const tendermintNoPopupMethods = Object.values(TENDERMINT_NO_POPUP_METHOD_TYPE) as string[];

          const { message, messageId, origin } = request;
          console.log('message', message);

          try {
            if (!message?.method || !tendermintMethods.includes(message.method)) {
              throw new TendermintRPCError(RPC_ERROR.METHOD_NOT_SUPPORTED, RPC_ERROR_MESSAGE[RPC_ERROR.METHOD_NOT_SUPPORTED]);
            }

            const { method } = message;

            const {
              currentEthereumNetwork,
              currentAccount,
              additionalChains,
              queues,
              allowedOrigins,
              currentAllowedChains,
              currentAccountAllowedOrigins,
              password,
            } = await chromeStorage();

            const tendermintAdditionalChains = additionalChains.filter((item) => item.line === 'TENDERMINT') as TendermintChain[];

            if (tendermintPopupMethods.includes(method)) {
              if (method === 'ten_requestAccounts') {
                const { params } = message;

                const allChains = [...TENDERMINT_CHAINS, ...tendermintAdditionalChains];

                if (!allChains.map((item) => item.chainName).includes(params?.chainName)) {
                  throw new TendermintRPCError(RPC_ERROR.INVALID_INPUT, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_INPUT]);
                }

                const chain = allChains.find((item) => item.chainName === message.params.chainName);

                if (
                  chain?.id &&
                  [...currentAllowedChains, ...additionalChains].map((item) => item.id).includes(chain?.id) &&
                  currentAccountAllowedOrigins.includes(origin)
                ) {
                  const keyPair = getKeyPair(currentAccount, chain, password);
                  const address = getAddress(chain, keyPair?.publicKey);

                  const publicKey = keyPair?.publicKey.toString('hex');

                  responseToWeb({
                    response: {
                      result: { address, publicKey },
                    },
                    message,
                    messageId,
                    origin,
                  });
                } else {
                  await setStorage('queues', [...queues, request]);
                  await openWindow();
                }
              }

              if (method === 'ten_addChain') {
                const { params } = message;

                const allChains = [...TENDERMINT_CHAINS];
                const allChainsName = allChains.map((item) => item.chainName);

                const schema = tenAddChainParamsSchema(allChainsName);

                try {
                  const validatedParams = (await schema.validateAsync(params)) as TenAddChainParams;

                  await setStorage('queues', [...queues, { ...request, message: { ...request.message, method, params: validatedParams } }]);
                  await openWindow();
                } catch (err) {
                  throw new TendermintRPCError(RPC_ERROR.INVALID_INPUT, `${err as string}`);
                }
              }

              if (method === 'ten_supportedChainNames') {
                const official = TENDERMINT_CHAINS.map((item) => item.chainName);

                const unofficial = additionalChains.map((item) => item.chainName);

                responseToWeb({
                  response: {
                    result: { official, unofficial },
                  },
                  message,
                  messageId,
                  origin,
                });
              }

              if (method === 'ten_signAmino') {
                const { params } = message;

                const allChains = [...TENDERMINT_CHAINS, ...tendermintAdditionalChains];

                const allChainNames = allChains.map((item) => item.chainName);

                const chain = allChains.find((item) => item.chainName === message.params.chainName);

                const schema = tenSignAminoParamsSchema(allChainNames, chain ? chain.chainId : '');

                try {
                  const validatedParams = (await schema.validateAsync(params)) as TenSignAminoParams;

                  await setStorage('queues', [...queues, { ...request, message: { ...request.message, method, params: validatedParams } }]);
                  await openWindow();
                } catch (err) {
                  throw new TendermintRPCError(RPC_ERROR.INVALID_INPUT, `${err as string}`);
                }
              }

              if (method === 'ten_test') {
                const { params } = message;

                console.log(new Uint8Array(Buffer.from(params.ddd as unknown as string, 'hex')));
              }
            }

            if (tendermintNoPopupMethods.includes(message.method)) {
              throw new TendermintRPCError(RPC_ERROR.METHOD_NOT_SUPPORTED, RPC_ERROR_MESSAGE[RPC_ERROR.METHOD_NOT_SUPPORTED]);
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

            console.log(e);
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

          const { message, messageId, origin } = request;
          console.log('message', message);

          try {
            if (!message?.method || !ethereumMethods.includes(message.method)) {
              throw new EthereumRPCError(RPC_ERROR.UNSUPPORTED_METHOD, ETHEREUM_RPC_ERROR_MESSAGE[RPC_ERROR.UNSUPPORTED_METHOD], message?.id);
            }

            const { method, id } = message;

            const { currentEthereumNetwork, currentAccount, getPairKey, password } = await chromeStorage();

            if (ethereumPopupMethods.includes(method)) {
              if (!password) {
                console.log(password);
                throw new EthereumRPCError(RPC_ERROR.UNAUTHORIZED, ETHEREUM_RPC_ERROR_MESSAGE[RPC_ERROR.UNAUTHORIZED], id);
              }

              const keyPair = getPairKey('ethereum', password);

              // if (method === ETHEREUM_POPUP_METHOD_TYPE.ETH__SIGN) {
              //   const { params } = message;

              //   console.log(getAddress(keyPair.publicKey));

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

              //   console.log(await determineTxType(params[0]));
              // }
            } else {
              const params = method === ETHEREUM_METHOD_TYPE.ETH__GET_BALANCE && message.params.length === 1 ? [...message.params, 'latest'] : message.params;

              const response = await requestRPC(method, params, id);
              console.log('rpc response', response);
              responseToWeb({ response, message, messageId, origin });
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

            console.log(e);
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

  // chrome.storage.onChanged.addListener((changes) => {
  //   // eslint-disable-next-line no-restricted-syntax
  //   for (const [key, { newValue }] of Object.entries(changes)) {
  //     console.log(key, newValue);
  //     if (key === 'queues') {
  //       void chrome.browserAction.setBadgeText({ text: '1' });
  //     }
  //   }
  // });

  chrome.windows.onRemoved.addListener((windowId) => {
    void (async function asyncHandler() {
      const currentWindowId = await getStorage('windowId');

      if (currentWindowId === windowId) {
        const queues = await getStorage('queues');

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
        });

        await setStorage('queues', []);
      }
    })();
  });

  chrome.runtime.onStartup.addListener(() => {
    console.log('startup');
    void (async function async() {
      await setStorage('queues', []);
      await setStorage('windowId', null);
      await setStorage('password', null);
    })();
  });

  chrome.runtime.onInstalled.addListener((details) => {
    void (async function async() {
      if (details.reason === 'install') {
        await setStorage('queues', []);
        await setStorage('windowId', null);
        await setStorage('accounts', []);
        await setStorage('accountName', {});
        await setStorage('additionalChains', []);
        await setStorage('additionalEthereumNetworks', []);
        await setStorage('encryptedPassword', null);
        await setStorage('selectedAccountId', '');

        await setStorage('theme', '' as ThemeType);

        await setStorage('rootPath', PATH.DASHBOARD);

        await setStorage('language', '' as LanguageType);
        await setStorage('currency', '' as CurrencyType);

        await setStorage('allowedChainIds', []);
        await setStorage('allowedOrigins', []);
        await setStorage('selectedChainId', '');
        await setStorage('selectedEthereumNetworkId', '');

        await setStorage('password', null);
        await openTab();
      }
    })();
  });
}

background();
