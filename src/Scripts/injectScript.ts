import { v4 as uuidv4 } from 'uuid';

import { LINE_TYPE } from '~/constants/chain';
import { LISTENER_TYPE, MESSAGE_TYPE } from '~/constants/message';
import type {
  EthereumRequestMessage,
  ListenerMessage,
  ListenerType,
  RequestMessage,
  ResponseMessage,
  TendermintRequestMessage,
  WebToContentScriptEventMessage,
} from '~/types/message';

(function injectScript() {
  // console.log('injectScript');
  window.cosmostation = {
    ethereum: {
      on: (eventName: ListenerType, eventHandler: (data: ResponseMessage) => void) => {
        const handler = (event: MessageEvent<ListenerMessage<ResponseMessage>>) => {
          if (event.data?.isCosmostation && event.data?.type === eventName) {
            eventHandler(event.data.message);
          }
        };

        window.addEventListener('message', handler);
      },
      request: (message: EthereumRequestMessage) =>
        new Promise((res, rej) => {
          const messageId = uuidv4();

          const handler = (event: MessageEvent<WebToContentScriptEventMessage<ResponseMessage>>) => {
            console.log('inject listener', event);

            if (event.data?.isCosmostation && event.data?.type === MESSAGE_TYPE.RESPONSE__WEB_TO_CONTENT_SCRIPT && event.data?.messageId === messageId) {
              console.log('inject listener2');
              window.removeEventListener('message', handler);

              const { data } = event;

              if (data.message?.error) {
                rej(data.message.error);
              } else {
                res(data.message.result);
              }
              console.log(`response-${messageId}-inject-script`, event);
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
      on: (eventName: ListenerType, eventHandler: (data: ResponseMessage) => void) => {
        const handler = (event: MessageEvent<ListenerMessage<ResponseMessage>>) => {
          if (event.data?.isCosmostation && event.data?.type === eventName) {
            eventHandler(event.data.message);
          }
        };

        window.addEventListener('message', handler);
      },
      request: (message: TendermintRequestMessage) =>
        new Promise((res, rej) => {
          const messageId = uuidv4();

          const handler = (event: MessageEvent<WebToContentScriptEventMessage<ResponseMessage>>) => {
            console.log('inject listener', event);

            if (event.data?.isCosmostation && event.data?.type === MESSAGE_TYPE.RESPONSE__WEB_TO_CONTENT_SCRIPT && event.data?.messageId === messageId) {
              console.log('inject listener2');
              console.log(`response-${messageId}-inject-script`, event);
              window.removeEventListener('message', handler);

              const { data } = event;

              if (data.message?.error) {
                rej(data.message.error);
              } else {
                res(data.message.result);
              }
            }
          };

          window.addEventListener('message', handler);

          window.postMessage({
            isCosmostation: true,
            line: LINE_TYPE.TENDERMINT,
            type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
            messageId,
            message,
          });
        }),
    },
  };
})();
