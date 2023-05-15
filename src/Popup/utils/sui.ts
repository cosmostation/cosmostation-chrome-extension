import type { SuiObjectData } from '@mysten/sui.js';
import { Ed25519PublicKey } from '@mysten/sui.js';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import { chromeStorage } from '~/Popup/utils/chromeStorage';
import type { GetObject, GetObjectExists, Result } from '~/types/sui/rpc';

import { SuiRPCError } from './error';

export function getAddress(publicKey: Buffer) {
  const key = new Ed25519PublicKey(publicKey);

  return key.toSuiAddress();
}

export function isExists(object: Result<GetObject>): object is Result<GetObjectExists> {
  return object.result?.status === 'Exists';
}

export function getCoinType(type?: string) {
  if (!type || type?.split('::')[1] !== 'coin') {
    return '';
  }

  const startIndex = type.indexOf('<');
  const endIndex = type.indexOf('>');

  if (startIndex > -1 && endIndex > -1) {
    return type.substring(startIndex + 1, endIndex);
  }

  return '';
}

export function isKiosk(data: SuiObjectData) {
  return !!data.type && data.type.includes('kiosk') && !!data.content && 'fields' in data.content && 'kiosk' in data.content.fields;
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
