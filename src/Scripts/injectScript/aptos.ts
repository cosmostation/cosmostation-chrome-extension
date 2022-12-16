import { v4 as uuidv4 } from 'uuid';

import { LINE_TYPE } from '~/constants/chain';
import { MESSAGE_TYPE } from '~/constants/message';
import type { AptosListenerType, AptosRequestMessage, ContentScriptToWebEventMessage, ListenerMessage, ResponseMessage } from '~/types/message';
import type {
  AptosAccountResponse,
  AptosConnectResponse,
  AptosDisconnectResponse,
  AptosIsConnectedResponse,
  AptosNetworkResponse,
  AptosSignAndSubmitTransactionResponse,
  AptosSignMessage,
  AptosSignMessageResponse,
  AptosSignPayload,
  AptosSignTransactionResponse,
} from '~/types/message/aptos';

const request = (message: AptosRequestMessage) =>
  new Promise((res, rej) => {
    const messageId = uuidv4();

    const handler = (event: MessageEvent<ContentScriptToWebEventMessage<ResponseMessage, AptosRequestMessage>>) => {
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
      line: LINE_TYPE.APTOS,
      type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
      messageId,
      message,
    });
  });

const on = (eventName: AptosListenerType, eventHandler: (data: unknown) => void) => {
  const handler = (event: MessageEvent<ListenerMessage<ResponseMessage>>) => {
    if (event.data?.isCosmostation && event.data?.type === eventName && event.data?.line === 'APTOS') {
      if (eventName === 'accountChange' && !event.data?.message?.result) {
        void (async () => {
          try {
            const account = (await request({ method: 'aptos_account', params: undefined })) as AptosAccountResponse;

            eventHandler(account.address);
          } catch {
            eventHandler('');
          }
        })();
      } else {
        eventHandler(event.data?.message?.result);
      }
    }
  };

  window.addEventListener('message', handler);

  window.cosmostation.handlerInfos.push({ line: 'APTOS', eventName, originHandler: eventHandler, handler });
};

const off = (eventName: AptosListenerType, eventHandler?: (data: unknown) => void) => {
  const handlerInfos = window.cosmostation.handlerInfos.filter(
    (item) => item.line === 'APTOS' && item.eventName === eventName && item.originHandler === eventHandler,
  );
  const notHandlerInfos = window.cosmostation.handlerInfos.filter(
    (item) => !(item.line === 'APTOS' && item.eventName === eventName && item.originHandler === eventHandler),
  );

  handlerInfos.forEach((handlerInfo) => {
    window.removeEventListener('message', handlerInfo.handler);
  });

  window.cosmostation.handlerInfos = notHandlerInfos;
};

const connect = () => request({ method: 'aptos_connect', params: undefined }) as Promise<AptosConnectResponse>;
const disconnect = () => request({ method: 'aptos_disconnect', params: undefined }) as Promise<AptosDisconnectResponse>;
const isConnected = () => request({ method: 'aptos_isConnected', params: undefined }) as Promise<AptosIsConnectedResponse>;
const network = () => request({ method: 'aptos_network', params: undefined }) as Promise<AptosNetworkResponse>;
const account = () => request({ method: 'aptos_account', params: undefined }) as Promise<AptosAccountResponse>;
const signAndSubmitTransaction = (payload: AptosSignPayload) =>
  request({ method: 'aptos_signAndSubmitTransaction', params: [payload] }) as Promise<AptosSignAndSubmitTransactionResponse>;
const signTransaction = (payload: AptosSignPayload) => request({ method: 'aptos_signTransaction', params: [payload] }) as Promise<AptosSignTransactionResponse>;
const signMessage = (params: AptosSignMessage['params'][0]) => request({ method: 'aptos_signMessage', params: [params] }) as Promise<AptosSignMessageResponse>;

const onAccountChange = (eventHandler: (data: unknown) => void) => {
  on('accountChange', eventHandler);
};

const offAccountChange = (eventHandler: (data: unknown) => void) => {
  off('accountChange', eventHandler);
};

const onNetworkChange = (eventHandler: (data: unknown) => void) => {
  on('networkChange', eventHandler);
};

const offNetworkChange = (eventHandler: (data: unknown) => void) => {
  off('networkChange', eventHandler);
};

export const aptos: Aptos = {
  on,
  off,
  request,
  account,
  connect,
  disconnect,
  isConnected,
  signAndSubmitTransaction,
  signTransaction,
  signMessage,
  network,
  onAccountChange,
  offAccountChange,
  onNetworkChange,
  offNetworkChange,
};
