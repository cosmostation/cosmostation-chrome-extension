import '~/Popup/i18n/background';

import { ecsign, hashPersonalMessage, stripHexPrefix, toRpcSig } from 'ethereumjs-util';

import { ETHEREUM_METHOD_TYPE, ETHEREUM_POPUP_METHOD_TYPE, RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/ethereum';
import { IN_MEMORY_MESSAGE_TYPE, MESSAGE_TYPE } from '~/constants/message';
import { THEME_TYPE } from '~/constants/theme';
import { getCurrentAccount, getStorage, setStorage } from '~/Popup/utils/chromeStorage';
import { openTab } from '~/Popup/utils/chromeTabs';
import { EthereumRPCError } from '~/Popup/utils/error';
import { getAddress, personalSign, rpcResponse, sign } from '~/Popup/utils/ethereum';
import { responseToWeb } from '~/Popup/utils/message';
import type {
  ContentScriptToBackgroundEventMessage,
  InMemoryMessage,
  RequestMessage,
  ResponseMessage,
} from '~/types/message';

import { chromeStorage } from './chromeStorage';
import { determineTxType, requestRPC } from './ethereum';
import { initI18n } from './i18n';
import { inMemory } from './inMemory';
import { persistent } from './persistent';
import { mnemonicToPair, privateKeyToPair } from '../utils/crypto';

function background() {
  const memory = inMemory();
  console.log('background start');

  chrome.runtime.onMessage.addListener((request: ContentScriptToBackgroundEventMessage<RequestMessage>, sender) => {
    console.log('content-script to background request sender', request, sender);
    // console.log('localStorage', localStorage.getItem('i18nextLng'));

    if (request?.type === MESSAGE_TYPE.REQUEST__CONTENT_SCRIPT_TO_BACKGROUND) {
      const password = memory.get('password');

      void (async function asyncHandler() {
        // if (request.message.method === 'requestAccount') {
        //   const currentAccount = await getCurrentAccount();
        // }

        if (request.line === 'ETHEREUM') {
          const ethereumMethods = Object.values(ETHEREUM_METHOD_TYPE) as string[];
          const ethereumPopupMethods = Object.values(ETHEREUM_POPUP_METHOD_TYPE) as string[];

          const { message, messageId, origin } = request;
          console.log('message', message);

          try {
            if (!message?.method || !ethereumMethods.includes(message.method)) {
              throw new EthereumRPCError(
                RPC_ERROR.UNSUPPORTED_METHOD,
                RPC_ERROR_MESSAGE[RPC_ERROR.UNSUPPORTED_METHOD],
                message?.id,
              );
            }

            const { method, id } = message;

            const { currentEthereumNetwork, currentAccount, getPairKey } = await chromeStorage();

            if (ethereumPopupMethods.includes(method)) {
              if (!password) {
                console.log(password);
                throw new EthereumRPCError(RPC_ERROR.UNAUTHORIZED, RPC_ERROR_MESSAGE[RPC_ERROR.UNAUTHORIZED], id);
              }

              const keyPair = getPairKey('ethereum', password);

              if (method === ETHEREUM_POPUP_METHOD_TYPE.ETH__SIGN) {
                const { params } = message;

                console.log(getAddress(keyPair.publicKey));

                if (params?.[0].toLowerCase() !== getAddress(keyPair.publicKey).toLowerCase()) {
                  throw new EthereumRPCError(
                    RPC_ERROR.INVALID_PARAMS,
                    `${RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]} (must provide an Account address.)`,
                    id,
                  );
                }

                const dataToSign = params?.[1]
                  ? stripHexPrefix(params[1].startsWith('0x') ? params[1] : Buffer.from(params[1]).toString('hex'))
                  : undefined;

                if (!dataToSign) {
                  throw new EthereumRPCError(
                    RPC_ERROR.INVALID_PARAMS,
                    `${RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]} (must provide data to sign)`,
                    id,
                  );
                }

                if (dataToSign.length < 66 || dataToSign.length > 67) {
                  throw new EthereumRPCError(
                    RPC_ERROR.INVALID_PARAMS,
                    `${RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]} (eth_sign requires 32 byte message hash)`,
                    id,
                  );
                }

                responseToWeb({
                  message: rpcResponse(sign(dataToSign, keyPair.privateKey), id),
                  messageId,
                  origin,
                });
              } else if (method === ETHEREUM_POPUP_METHOD_TYPE.PERSONAL_SIGN) {
                const { params } = message;

                if (params?.[1].toLowerCase() !== getAddress(keyPair.publicKey).toLowerCase()) {
                  throw new EthereumRPCError(
                    RPC_ERROR.INVALID_PARAMS,
                    `${RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]} (must provide an Account address.)`,
                    id,
                  );
                }

                if (!params?.[0]) {
                  throw new EthereumRPCError(
                    RPC_ERROR.INVALID_PARAMS,
                    `${RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]} (must provide data to sign)`,
                    id,
                  );
                }

                responseToWeb({
                  message: rpcResponse(personalSign(params[0], keyPair.privateKey), id),
                  messageId,
                  origin,
                });
              } else if (method === ETHEREUM_POPUP_METHOD_TYPE.ETH__SEND_TRANSACTION) {
                const { params } = message;

                console.log(await determineTxType(params[0]));
              }
            } else {
              const params =
                method === ETHEREUM_METHOD_TYPE.ETH__GET_BALANCE && message.params.length === 1
                  ? [...message.params, 'latest']
                  : message.params;

              const response = await requestRPC(method, params, id);
              console.log('rpc response', response);
              responseToWeb({ message: response, messageId, origin });
            }
          } catch (e) {
            if (e instanceof EthereumRPCError) {
              responseToWeb({
                message: e.rpcMessage,
                messageId,
                origin,
              });
              return;
            }

            console.log(e);
            responseToWeb({
              message: {
                error: {
                  code: RPC_ERROR.INTERNAL,
                  message: `${RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL]}`,
                },
                jsonrpc: '2.0',
              },
              messageId,
              origin,
            });
          }
        }
      })();
    }
  });

  chrome.runtime.onMessage.addListener((request: InMemoryMessage, sender, sendResponse) => {
    console.log('in memory in background', request, sender);

    if (request?.type === MESSAGE_TYPE.IN_MEMORY) {
      const { message } = request;

      if (message.method === IN_MEMORY_MESSAGE_TYPE.GET) {
        sendResponse(memory.get(message.params.key));
      }

      if (message.method === IN_MEMORY_MESSAGE_TYPE.GET_ALL) {
        sendResponse(memory.getAll());
      }

      if (message.method === IN_MEMORY_MESSAGE_TYPE.SET) {
        memory.set(message.params.key, message.params.value);
        sendResponse(memory.get(message.params.key));
      }
    }
  });

  chrome.runtime.onStartup.addListener(() => {
    console.log('startup');
    void (async function async() {
      await setStorage('queues', []);
      await setStorage('windowId', null);
    })();
  });

  chrome.runtime.onInstalled.addListener((details) => {
    void (async function async() {
      if (details.reason === 'install') {
        await setStorage('queues', []);
        await setStorage('windowId', null);
        await setStorage('accounts', []);
        await setStorage('additionalChains', []);
        await setStorage('additionalEthereumNetworks', []);
        await setStorage('encryptedPassword', null);
        await setStorage('theme', THEME_TYPE.LIGHT);
        await setStorage('selectedAccountId', '');
        await openTab();
      }
    })();
  });

  const { doing } = persistent();
  void doing();
}

background();
