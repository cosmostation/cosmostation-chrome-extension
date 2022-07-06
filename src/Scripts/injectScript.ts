import { v4 as uuidv4 } from 'uuid';

import { LINE_TYPE } from '~/constants/chain';
import { MESSAGE_TYPE } from '~/constants/message';
import type { CosRequestAccountResponse, CosSignDirectParams, CosSignDirectResponse } from '~/types/cosmos/message';
import type { SignDirectDoc } from '~/types/cosmos/proto';
import type {
  ContentScriptToWebEventMessage,
  CosmosListenerType,
  CosmosRequestMessage,
  EthereumListenerType,
  EthereumRequestMessage,
  ListenerMessage,
  ResponseMessage,
} from '~/types/message';

(function injectScript() {
  window.cosmostation = {
    ethereum: {
      on: (eventName: EthereumListenerType, eventHandler: (data: unknown) => void) => {
        const handler = (event: MessageEvent<ListenerMessage<ResponseMessage>>) => {
          if (event.data?.isCosmostation && event.data?.type === eventName && event.data?.line === 'ETHEREUM') {
            eventHandler(event.data?.message?.result);
          }
        };

        window.addEventListener('message', handler);

        return handler;
      },
      off: (handler: (event: MessageEvent<ListenerMessage>) => void) => {
        window.removeEventListener('message', handler);
      },
      request: (message: EthereumRequestMessage) =>
        new Promise((res, rej) => {
          const messageId = uuidv4();

          const handler = (event: MessageEvent<ContentScriptToWebEventMessage<ResponseMessage, EthereumRequestMessage>>) => {
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
    cosmos: {
      on: (eventName: CosmosListenerType, eventHandler: (data: unknown) => void) => {
        const handler = (event: MessageEvent<ListenerMessage>) => {
          if (event.data?.isCosmostation && event.data?.type === eventName && event.data?.line === 'COSMOS') {
            eventHandler(event.data?.message);
          }
        };

        window.addEventListener('message', handler);

        return handler;
      },
      off: (handler: (event: MessageEvent<ListenerMessage>) => void) => {
        window.removeEventListener('message', handler);
      },
      request: (message: CosmosRequestMessage) =>
        new Promise((res, rej) => {
          const messageId = uuidv4();

          const handler = (event: MessageEvent<ContentScriptToWebEventMessage<ResponseMessage, CosmosRequestMessage>>) => {
            if (event.data?.isCosmostation && event.data?.type === MESSAGE_TYPE.RESPONSE__WEB_TO_CONTENT_SCRIPT && event.data?.messageId === messageId) {
              window.removeEventListener('message', handler);

              const { data } = event;

              if (data.response?.error) {
                rej(data.response.error);
              } else if (
                data.message.method === 'cos_requestAccount' ||
                data.message.method === 'cos_account' ||
                data.message.method === 'ten_requestAccount' ||
                data.message.method === 'ten_account'
              ) {
                const { publicKey } = data.response.result as CosRequestAccountResponse;

                res({
                  ...(data.response.result as { publicKey: string; address: string }),
                  publicKey: new Uint8Array(Buffer.from(publicKey as unknown as string, 'hex')),
                });
              } else if (data.message.method === 'cos_signDirect' || data.message.method === 'ten_signDirect') {
                const result = data.response.result as CosSignDirectResponse;

                const response: CosSignDirectResponse = {
                  ...result,
                  signed_doc: {
                    ...result.signed_doc,
                    auth_info_bytes: new Uint8Array(Buffer.from(result.signed_doc.auth_info_bytes as unknown as string, 'hex')),
                    body_bytes: new Uint8Array(Buffer.from(result.signed_doc.body_bytes as unknown as string, 'hex')),
                  },
                };

                res(response);
              } else {
                res(data.response.result);
              }
            }
          };

          window.addEventListener('message', handler);

          if (message.method === 'cos_signDirect' || message.method === 'ten_signDirect') {
            const { params } = message;

            const doc = params?.doc;

            const newDoc: SignDirectDoc = doc
              ? {
                  ...doc,
                  auth_info_bytes: doc.auth_info_bytes ? (Buffer.from(doc.auth_info_bytes).toString('hex') as unknown as Uint8Array) : doc.auth_info_bytes,
                  body_bytes: doc.body_bytes ? (Buffer.from(doc.body_bytes).toString('hex') as unknown as Uint8Array) : doc.body_bytes,
                }
              : doc;

            const newParams: CosSignDirectParams = params ? { ...params, doc: newDoc } : params;
            const newMessage = { ...message, params: newParams };

            window.postMessage({
              isCosmostation: true,
              line: LINE_TYPE.COSMOS,
              type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
              messageId,
              message: newMessage,
            });
          } else {
            window.postMessage({
              isCosmostation: true,
              line: LINE_TYPE.COSMOS,
              type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
              messageId,
              message,
            });
          }
        }),
    },
    tendermint: {
      on: (eventName: CosmosListenerType, eventHandler: (data: unknown) => void) => {
        const handler = (event: MessageEvent<ListenerMessage>) => {
          if (event.data?.isCosmostation && event.data?.type === eventName && event.data?.line === 'COSMOS') {
            eventHandler(event.data?.message);
          }
        };

        window.addEventListener('message', handler);

        return handler;
      },
      off: (handler: (event: MessageEvent<ListenerMessage>) => void) => {
        window.removeEventListener('message', handler);
      },
      request: (message: CosmosRequestMessage) =>
        new Promise((res, rej) => {
          const messageId = uuidv4();

          const handler = (event: MessageEvent<ContentScriptToWebEventMessage<ResponseMessage, CosmosRequestMessage>>) => {
            if (event.data?.isCosmostation && event.data?.type === MESSAGE_TYPE.RESPONSE__WEB_TO_CONTENT_SCRIPT && event.data?.messageId === messageId) {
              window.removeEventListener('message', handler);

              const { data } = event;

              if (data.response?.error) {
                rej(data.response.error);
              } else if (
                data.message.method === 'cos_requestAccount' ||
                data.message.method === 'cos_account' ||
                data.message.method === 'ten_requestAccount' ||
                data.message.method === 'ten_account'
              ) {
                const { publicKey } = data.response.result as CosRequestAccountResponse;

                res({
                  ...(data.response.result as { publicKey: string; address: string }),
                  publicKey: new Uint8Array(Buffer.from(publicKey as unknown as string, 'hex')),
                });
              } else if (data.message.method === 'cos_signDirect' || data.message.method === 'ten_signDirect') {
                const result = data.response.result as CosSignDirectResponse;

                const response: CosSignDirectResponse = {
                  ...result,
                  signed_doc: {
                    ...result.signed_doc,
                    auth_info_bytes: new Uint8Array(Buffer.from(result.signed_doc.auth_info_bytes as unknown as string, 'hex')),
                    body_bytes: new Uint8Array(Buffer.from(result.signed_doc.body_bytes as unknown as string, 'hex')),
                  },
                };

                res(response);
              } else {
                res(data.response.result);
              }
            }
          };

          window.addEventListener('message', handler);

          if (message.method === 'cos_signDirect' || message.method === 'ten_signDirect') {
            const { params } = message;

            const doc = params?.doc;

            const newDoc: SignDirectDoc = doc
              ? {
                  ...doc,
                  auth_info_bytes: doc.auth_info_bytes ? (Buffer.from(doc.auth_info_bytes).toString('hex') as unknown as Uint8Array) : doc.auth_info_bytes,
                  body_bytes: doc.body_bytes ? (Buffer.from(doc.body_bytes).toString('hex') as unknown as Uint8Array) : doc.body_bytes,
                }
              : doc;

            const newParams: CosSignDirectParams = params ? { ...params, doc: newDoc } : params;
            const newMessage = { ...message, params: newParams };

            window.postMessage({
              isCosmostation: true,
              line: LINE_TYPE.COSMOS,
              type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
              messageId,
              message: newMessage,
            });
          } else {
            window.postMessage({
              isCosmostation: true,
              line: LINE_TYPE.COSMOS,
              type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
              messageId,
              message,
            });
          }
        }),
    },
  };
})();
