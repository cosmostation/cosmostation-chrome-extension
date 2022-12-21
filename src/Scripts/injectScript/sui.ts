import { v4 as uuidv4 } from 'uuid';

import { LINE_TYPE } from '~/constants/chain';
import { MESSAGE_TYPE } from '~/constants/message';
import type { SuiPermissionType } from '~/types/chromeStorage';
import type { ContentScriptToWebEventMessage, ResponseMessage, SuiRequestMessage } from '~/types/message';
import type {
  SuiDisconnectResponse,
  SuiExecuteMoveCall,
  SuiExecuteMoveCallResponse,
  SuiGetAccountResponse,
  SuiGetPermissionsResponse,
  SuiSignAndExecuteTransaction,
  SuiSignAndExecuteTransactionResponse,
} from '~/types/message/sui';

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

const requestPermissions = async (permissions: SuiPermissionType[] = ['suggestTransactions', 'viewAccount']) => {
  try {
    await request({ method: 'sui_connect', params: permissions });
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

const getAccounts = async () => {
  const account = (await request({ method: 'sui_getAccount', params: undefined })) as SuiGetAccountResponse;
  return [account.address];
};

const getPublicKey = async () => {
  const account = (await request({ method: 'sui_getAccount', params: undefined })) as SuiGetAccountResponse;
  return account.publicKey;
};

const executeMoveCall = (data: SuiExecuteMoveCall['params'][0]) =>
  request({ method: 'sui_executeMoveCall', params: [data] }) as Promise<SuiExecuteMoveCallResponse>;

const signAndExecuteTransaction = (data: SuiSignAndExecuteTransaction['params'][0], type?: SuiSignAndExecuteTransaction['params'][1]) =>
  request({ method: 'sui_signAndExecuteTransaction', params: type ? [data, type] : [data] }) as Promise<SuiSignAndExecuteTransactionResponse>;

export const sui: Sui = {
  request,
  connect,
  disconnect,
  requestPermissions,
  hasPermissions,
  getAccounts,
  getPublicKey,
  executeMoveCall,
  signAndExecuteTransaction,
};
