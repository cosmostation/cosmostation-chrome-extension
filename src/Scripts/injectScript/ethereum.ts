import { v4 as uuidv4 } from 'uuid';

import { LINE_TYPE } from '~/constants/chain';
import { COSMOSTATION_ENCODED_LOGO_IMAGE, COSMOSTATION_RDNS, COSMOSTATION_WALLET_NAME } from '~/constants/common';
import { EIP_6963_EVENTS } from '~/constants/ethereum';
import { MESSAGE_TYPE } from '~/constants/message';
import type { EIP6963ProviderDetail, EIP6963ProviderInfo } from '~/types/ethereum/eip6963';
import type { ContentScriptToWebEventMessage, EthereumListenerType, EthereumRequestMessage, ListenerMessage, ResponseMessage } from '~/types/message';
import type { EthRequestAccountsResponse } from '~/types/message/ethereum';

export const request = (message: EthereumRequestMessage) =>
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
  });

const on = (eventName: EthereumListenerType, eventHandler: (data: unknown) => void) => {
  const handler = (event: MessageEvent<ListenerMessage<ResponseMessage>>) => {
    if (event.data?.isCosmostation && event.data?.type === eventName && event.data?.line === 'ETHEREUM') {
      if (eventName === 'accountsChanged' && Array.isArray(event.data?.message?.result) && event.data?.message?.result.length === 0) {
        void (async () => {
          try {
            const account = (await request({ method: 'eth_accounts', params: {} })) as EthRequestAccountsResponse;

            eventHandler(account);
          } catch {
            eventHandler([]);
          }
        })();
      } else {
        eventHandler(event.data?.message?.result);
      }
    }
  };

  window.addEventListener('message', handler);
  window.cosmostation.handlerInfos.push({ line: 'ETHEREUM', eventName, originHandler: eventHandler, handler });

  return handler;
};

const off = (eventName: EthereumListenerType | ((event: MessageEvent<ListenerMessage>) => void), eventHandler?: (data: unknown) => void) => {
  if (eventHandler === undefined) {
    window.removeEventListener('message', eventName as (event: MessageEvent<ListenerMessage>) => void);
  } else {
    const handlerInfos = window.cosmostation.handlerInfos.filter(
      (item) => item.line === 'ETHEREUM' && item.eventName === eventName && item.originHandler === eventHandler,
    );
    const notHandlerInfos = window.cosmostation.handlerInfos.filter(
      (item) => !(item.line === 'ETHEREUM' && item.eventName === eventName && item.originHandler === eventHandler),
    );

    handlerInfos.forEach((handlerInfo) => {
      window.removeEventListener('message', handlerInfo.handler);
    });

    window.cosmostation.handlerInfos = notHandlerInfos;
  }
};

export const ethereum: Ethereum = {
  isMetaMask: false,
  on,
  addListener: on,
  off,
  removeListener: off,
  request,
  // eslint-disable-next-line consistent-return
  send: (method, params) => {
    const messageId = uuidv4();
    if (typeof method === 'string') {
      return new Promise((res, rej) => {
        const handler = (event: MessageEvent<ContentScriptToWebEventMessage<ResponseMessage, EthereumRequestMessage>>) => {
          if (event.data?.isCosmostation && event.data?.type === MESSAGE_TYPE.RESPONSE__WEB_TO_CONTENT_SCRIPT && event.data?.messageId === messageId) {
            window.removeEventListener('message', handler);

            const { data } = event;

            if (data.response?.error) {
              rej(data.response);
            } else {
              res({ result: data.response.result, jsonrpc: '2.0', id: undefined });
            }
          }
        };

        window.addEventListener('message', handler);

        window.postMessage({
          isCosmostation: true,
          line: LINE_TYPE.ETHEREUM,
          type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
          messageId,
          message: {
            method,
            params,
          },
        });
      });
    }

    const handler = (event: MessageEvent<ContentScriptToWebEventMessage<ResponseMessage, EthereumRequestMessage>>) => {
      if (event.data?.isCosmostation && event.data?.type === MESSAGE_TYPE.RESPONSE__WEB_TO_CONTENT_SCRIPT && event.data?.messageId === messageId) {
        window.removeEventListener('message', handler);

        const { data } = event;

        if (typeof params === 'function') {
          if (data.response?.error) {
            params(data.response.error, { id: method.id, jsonrpc: '2.0', method: method.method, error: data.response.error });
          } else {
            params(null, { id: method.id, jsonrpc: '2.0', method: method.method, error: data.response.error, result: data.response.result });
          }
        }
      }
    };

    window.addEventListener('message', handler);

    window.postMessage({
      isCosmostation: true,
      line: LINE_TYPE.ETHEREUM,
      type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
      messageId,
      message: {
        method: method.method,
        params: method.params,
      },
    });
  },
  sendAsync: (message, callback) => {
    const messageId = uuidv4();

    const handler = (event: MessageEvent<ContentScriptToWebEventMessage<ResponseMessage, EthereumRequestMessage>>) => {
      if (event.data?.isCosmostation && event.data?.type === MESSAGE_TYPE.RESPONSE__WEB_TO_CONTENT_SCRIPT && event.data?.messageId === messageId) {
        window.removeEventListener('message', handler);

        const { data } = event;

        if (data.response?.error) {
          callback(data.response.error, { id: message.id, jsonrpc: '2.0', method: message.method, error: data.response.error });
        } else {
          callback(null, { id: message.id, jsonrpc: '2.0', method: message.method, error: data.response.error, result: data.response.result });
        }
      }
    };

    window.addEventListener('message', handler);

    window.postMessage({
      isCosmostation: true,
      line: LINE_TYPE.ETHEREUM,
      type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
      messageId,
      message: {
        method: message.method,
        params: message.params,
      },
    });
  },
  enable: () => request({ method: 'eth_requestAccounts', params: [] }) as Promise<EthRequestAccountsResponse>,
};

const providerUUID = uuidv4();

const dispatchProviderAnnouncement = () => {
  const info: EIP6963ProviderInfo = {
    uuid: providerUUID,
    name: COSMOSTATION_WALLET_NAME,
    icon: COSMOSTATION_ENCODED_LOGO_IMAGE,
    rdns: COSMOSTATION_RDNS,
  };

  const detail: EIP6963ProviderDetail = Object.freeze({ info, provider: ethereum });

  window.dispatchEvent(
    new CustomEvent(EIP_6963_EVENTS.announce, {
      detail,
    }),
  );
};

export const announceEip6963Provider = () => {
  window.addEventListener(EIP_6963_EVENTS.request, () => {
    dispatchProviderAnnouncement();
  });

  dispatchProviderAnnouncement();
};
