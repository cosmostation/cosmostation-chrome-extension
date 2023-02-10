import { v4 as uuidv4 } from 'uuid';

import { LINE_TYPE } from '~/constants/chain';
import { MESSAGE_TYPE } from '~/constants/message';
import type { SuiPermissionType } from '~/types/chromeStorage';
import type { ContentScriptToWebEventMessage, ListenerMessage, ResponseMessage, SuiListenerType, SuiRequestMessage } from '~/types/message';
import type {
  SuiDisconnectResponse,
  SuiExecuteMoveCall,
  SuiExecuteMoveCallResponse,
  SuiGetAccountResponse,
  SuiGetPermissionsResponse,
  SuiSignAndExecuteTransaction,
  SuiSignAndExecuteTransactionResponse,
} from '~/types/message/sui';

export type Values = {
  accounts: string[];
};

const getSui = () => {
  const values: Values = {
    accounts: [],
  };

  const setValue = <T extends keyof Values>(key: T, value: Values[T]) => {
    values[key] = value;
  };

  const request = (message: SuiRequestMessage) =>
    new Promise((res, rej) => {
      const messageId = uuidv4();

      const handler = (event: MessageEvent<ContentScriptToWebEventMessage<ResponseMessage, SuiRequestMessage>>) => {
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
        line: LINE_TYPE.SUI,
        type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
        messageId,
        message,
      });
    });

  const getAccounts = async () => {
    const account = (await request({ method: 'sui_getAccount', params: undefined })) as SuiGetAccountResponse;
    return [account.address];
  };

  const getPublicKey = async () => {
    const account = (await request({ method: 'sui_getAccount', params: undefined })) as SuiGetAccountResponse;
    return account.publicKey;
  };

  const requestPermissions = async (permissions: SuiPermissionType[] = ['suggestTransactions', 'viewAccount']) => {
    try {
      await request({ method: 'sui_connect', params: permissions });
      values.accounts = await getAccounts();
      return true;
    } catch {
      return false;
    }
  };

  const connect = requestPermissions;

  const disconnect = () => request({ method: 'sui_disconnect', params: undefined }) as Promise<SuiDisconnectResponse>;

  const hasPermissions = async (permissions: SuiPermissionType[] = ['suggestTransactions', 'viewAccount']) => {
    try {
      const currentPermissions = (await request({ method: 'sui_getPermissions', params: undefined })) as SuiGetPermissionsResponse;

      return permissions.every((permission) => currentPermissions.includes(permission));
    } catch {
      return false;
    }
  };

  const executeMoveCall = (data: SuiExecuteMoveCall['params'][0]) =>
    request({ method: 'sui_executeMoveCall', params: [data] }) as Promise<SuiExecuteMoveCallResponse>;

  const signAndExecuteTransaction = (data: SuiSignAndExecuteTransaction['params'][0], type?: SuiSignAndExecuteTransaction['params'][1]) =>
    request({ method: 'sui_signAndExecuteTransaction', params: type ? [data, type] : [data] }) as Promise<SuiSignAndExecuteTransactionResponse>;

  const on = (eventName: SuiListenerType, eventHandler: (data: unknown) => void) => {
    const handler = (event: MessageEvent<ListenerMessage<ResponseMessage>>) => {
      if (event.data?.isCosmostation && event.data?.type === eventName && event.data?.line === 'SUI') {
        if (eventName === 'accountChange' && !event.data?.message?.result) {
          eventHandler('');
        } else {
          eventHandler(event.data?.message?.result);
        }
      }
    };

    window.addEventListener('message', handler);

    window.cosmostation.handlerInfos.push({ line: 'SUI', eventName, originHandler: eventHandler, handler });
  };

  const off = (eventName: SuiListenerType, eventHandler?: (data: unknown) => void) => {
    const handlerInfos = window.cosmostation.handlerInfos.filter(
      (item) => item.line === 'SUI' && item.eventName === eventName && item.originHandler === eventHandler,
    );
    const notHandlerInfos = window.cosmostation.handlerInfos.filter(
      (item) => !(item.line === 'SUI' && item.eventName === eventName && item.originHandler === eventHandler),
    );

    handlerInfos.forEach((handlerInfo) => {
      window.removeEventListener('message', handlerInfo.handler);
    });

    window.cosmostation.handlerInfos = notHandlerInfos;
  };

  return {
    values,
    request,
    connect,
    disconnect,
    requestPermissions,
    hasPermissions,
    getAccounts,
    getPublicKey,
    executeMoveCall,
    signAndExecuteTransaction,
    on,
    off,
    setValue,
  };
};

export const sui = getSui();
