import { Ed25519PublicKey } from '@mysten/sui.js';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import { chromeStorage } from '~/Popup/utils/chromeStorage';
import type { GetObject, GetObjectExists, Result } from '~/types/sui/rpc';

import { SuiRPCError } from './error';

export function getAddress(publicKey: Buffer) {
  const key = new Ed25519PublicKey(publicKey);

  return key.toSuiAddress();
}

// NOTE is needed?
export function isExists(object: Result<GetObject>): object is Result<GetObjectExists> {
  return object.result?.status === 'Exists';
}

// NOTE is needed?
export function getCoinType(type?: string) {
  if (!type) {
    return '';
  }
  // NOTE 코인 타입 예시가 필요함
  const startIndex = type.indexOf('<');
  const endIndex = type.indexOf('>');

  if (startIndex > -1 && endIndex > -1) {
    return type.substring(startIndex + 1, endIndex);
  }

  return '';
}

export async function requestRPC<T>(method: string, params: unknown, id?: string | number, url?: string) {
  const { currentSuiNetwork } = await chromeStorage();

  const rpcURL = url ?? currentSuiNetwork.rpcURL;

  const rpcId = id ?? new Date().getTime();

  try {
    const response = await fetch(rpcURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cosmostation: `extension/${String(process.env.VERSION)}`,
      },
      body: JSON.stringify({ method, params, jsonrpc: '2.0', id: rpcId }),
    });

    const responseJSON = (await response.json()) as { id?: number | string };

    if (id === undefined) {
      delete responseJSON?.id;
    }

    return responseJSON as unknown as T;
  } catch {
    throw new SuiRPCError(RPC_ERROR.INTERNAL, RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL], rpcId);
  }
}

// NOTE paySui가 지금은 뭐로 업그레이드 되었는지 모르겠음
// export function isPaySui(transaction: TransactionBlock) {
//   return transaction.blockData.transactions === 'paySui';
// }
