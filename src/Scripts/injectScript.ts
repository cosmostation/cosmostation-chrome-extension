import { v4 as uuidv4 } from 'uuid';

import { LINE_TYPE } from '~/constants/chain';
import { MESSAGE_TYPE } from '~/constants/message';
import type {
  ContentScriptToWebEventMessage,
  EthereumRequestMessage,
  ListenerMessage,
  ListenerType,
  ResponseMessage,
  TendermintRequestMessage,
} from '~/types/message';

(function injectScript() {
  window.cosmostation = {
    ethereum: {
      on: (eventName: ListenerType, eventHandler: (data: unknown) => void) => {
        const handler = (event: MessageEvent<ListenerMessage>) => {
          if (event.data?.isCosmostation && event.data?.type === eventName && event.data?.line === 'ETHEREUM') {
            eventHandler(event.data?.message);
          }
        };

        window.addEventListener('message', handler);
      },

      request: (message: EthereumRequestMessage) =>
        new Promise((res, rej) => {
          const messageId = uuidv4();

          const handler = (event: MessageEvent<ContentScriptToWebEventMessage<EthereumRequestMessage, ResponseMessage>>) => {
            if (event.data?.isCosmostation && event.data?.type === MESSAGE_TYPE.RESPONSE__WEB_TO_CONTENT_SCRIPT && event.data?.messageId === messageId) {
              window.removeEventListener('message', handler);

              const { data } = event;

              if (data.response?.error) {
                rej(data.response.error);
              } else {
                res(data.response.result);
              }
            }
          };

          window.addEventListener('message', handler);

          window.postMessage({
            isCosmostation: true,
            line: LINE_TYPE.ETHEREUM,
            type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
            messageId,
            message,
          });
        }),
    },
    tendermint: {
      on: (eventName: ListenerType, eventHandler: (data: unknown) => void) => {
        const handler = (event: MessageEvent<ListenerMessage>) => {
          if (event.data?.isCosmostation && event.data?.type === eventName && event.data?.line === 'TENDERMINT') {
            eventHandler(event.data?.message);
          }
        };

        window.addEventListener('message', handler);

        return handler;
      },
      off: (handler: (event: MessageEvent<ListenerMessage>) => void) => {
        window.removeEventListener('message', handler);
      },
      request: (message: TendermintRequestMessage) =>
        new Promise((res, rej) => {
          const messageId = uuidv4();

          const handler = (event: MessageEvent<ContentScriptToWebEventMessage<TendermintRequestMessage, ResponseMessage>>) => {
            if (event.data?.isCosmostation && event.data?.type === MESSAGE_TYPE.RESPONSE__WEB_TO_CONTENT_SCRIPT && event.data?.messageId === messageId) {
              window.removeEventListener('message', handler);

              const { data } = event;

              if (data.response?.error) {
                rej(data.response.error);
              } else if (data.message.method === 'ten_requestAccounts') {
                const { publicKey } = data.response.result as { publicKey: string; address: string };

                res({ ...(data.response.result as { publicKey: string; address: string }), publicKey: new Uint8Array(Buffer.from(publicKey, 'hex')) });
              } else {
                res(data.response.result);
              }
            }
          };

          window.addEventListener('message', handler);

          if (message.method === 'ten_test') {
            const { params } = message;

            const newParams = { ddd: Buffer.from(params.ddd).toString('hex') };
            const newMessage = { ...message, params: newParams };

            window.postMessage({
              isCosmostation: true,
              line: LINE_TYPE.TENDERMINT,
              type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
              messageId,
              message: newMessage,
            });
          } else {
            window.postMessage({
              isCosmostation: true,
              line: LINE_TYPE.TENDERMINT,
              type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
              messageId,
              message,
            });
          }
        }),
    },
  };
})();
