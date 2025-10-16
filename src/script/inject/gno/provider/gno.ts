import { RESPONSE_CODE, RESPONSE_MESSAGE, RESPONSE_STATUS } from '@/constants/gno';
import type {
  GnoConnectResponse,
  GnoGetAccountResponse,
  GnoGetNetworkResponse,
  GnoSignAndSendTransactionResponse,
  GnoSignMessageResponse,
  GnoSignTransactionResponse,
  GnoSwitchNetworkResponse,
  GnoTransactionParams,
} from '@/types/message/inject/gno';

import { gnoRequestApp } from '../request';

const connect = async () => {
  try {
    const result = (await gnoRequestApp({ method: 'gno_connect', params: undefined })) as GnoConnectResponse;
    return result;
  } catch {
    const result: GnoConnectResponse = {
      code: RESPONSE_CODE.CONNECTION_FAILURE,
      status: RESPONSE_STATUS.FAILURE,
      message: RESPONSE_MESSAGE.CONNECTION_FAILURE,
      data: {},
    };
    return result;
  }
};

const getAccount = async () => {
  try {
    const result = (await gnoRequestApp({ method: 'gno_getAccount', params: undefined })) as GnoGetAccountResponse;
    return result;
  } catch {
    const result: GnoGetAccountResponse = {
      code: RESPONSE_CODE.CONNECTION_FAILURE,
      status: RESPONSE_STATUS.FAILURE,
      message: RESPONSE_MESSAGE.CONNECTION_FAILURE,
      data: {
        address: '',
        publicKey: null,
      },
    };
    return result;
  }
};

const getNetwork = async () => {
  try {
    const result = (await gnoRequestApp({ method: 'gno_getNetwork', params: undefined })) as GnoGetNetworkResponse;
    return result;
  } catch {
    const result: GnoGetNetworkResponse = {
      code: RESPONSE_CODE.CONNECTION_FAILURE,
      status: RESPONSE_STATUS.FAILURE,
      message: RESPONSE_MESSAGE.CONNECTION_FAILURE,
      data: undefined,
    };
    return result;
  }
};

const switchNetwork = async (chainId: string) => {
  const result = (await gnoRequestApp({ method: 'gno_switchNetwork', params: [chainId] })) as GnoSwitchNetworkResponse;
  return result;
};

const signTransaction = async (data: GnoTransactionParams[0]) => {
  try {
    const params = [data, false];
    const result = (await gnoRequestApp({ method: 'gno_signTransaction', params })) as GnoSignTransactionResponse;
    return result;
  } catch (e) {
    if (typeof e === 'object' && e !== null && 'code' in e && e.code === 4001) {
      const result: GnoSignTransactionResponse = {
        code: 4000,
        status: RESPONSE_STATUS.FAILURE,
        message: '',
        data: undefined,
      };
      return result;
    }
    const result: GnoSignTransactionResponse = {
      code: 5000,
      status: RESPONSE_STATUS.FAILURE,
      message: '',
      data: undefined,
    };
    return result;
  }
};

const signAndSendTransaction = async (data: GnoTransactionParams[0]) => {
  try {
    const params = [data, false];
    const result = (await gnoRequestApp({ method: 'gno_signAndSendTransaction', params })) as GnoSignAndSendTransactionResponse;
    return result;
  } catch (e) {
    if (typeof e === 'object' && e !== null && 'code' in e && e.code === 4001) {
      const result: GnoSignAndSendTransactionResponse = {
        code: 4000,
        status: RESPONSE_STATUS.FAILURE,
        message: '',
        data: undefined,
      };
      return result;
    }
    const result: GnoSignAndSendTransactionResponse = {
      code: 5000,
      status: RESPONSE_STATUS.FAILURE,
      message: '',
      data: undefined,
    };
    return result;
  }
};

const signMessage = async (data: string) => {
  try {
    const params = [data];
    const result = (await gnoRequestApp({ method: 'gno_signMessage', params })) as GnoSignMessageResponse;
    return result;
  } catch (e) {
    if (typeof e === 'object' && e !== null && 'code' in e && e.code === 4001) {
      const result: GnoSignMessageResponse = {
        code: 4000,
        status: RESPONSE_STATUS.FAILURE,
        message: '',
        data: undefined,
      };
      return result;
    }
    const result: GnoSignMessageResponse = {
      code: 5000,
      status: RESPONSE_STATUS.FAILURE,
      message: '',
      data: undefined,
    };
    return result;
  }
};

export class CosmostationGno implements GnoProvider {
  private static instance: GnoProvider;

  public static getInstance(): GnoProvider {
    if (!CosmostationGno.instance) {
      CosmostationGno.instance = new CosmostationGno();
    }
    return CosmostationGno.instance;
  }

  GetAccount = getAccount;
  SwitchNetwork = switchNetwork;
  AddEstablish = connect;
  DoContract = signAndSendTransaction;
  Sign = signTransaction;
  SignTx = signTransaction;

  // custom
  Connect = connect;
  SignMessage = signMessage;
  SignAndSendTransaction = signAndSendTransaction;
  SignTransaction = signTransaction;
  GetNetwork = getNetwork;
}
