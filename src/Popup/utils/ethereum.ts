import {
  Address,
  ecsign,
  hashPersonalMessage,
  isHexString,
  stripHexPrefix,
  toBuffer,
  toChecksumAddress,
  toRpcSig,
} from 'ethereumjs-util';
import * as TinySecp256k1 from 'tiny-secp256k1';

import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/ethereum';
import { EthereumRPCError } from '~/Popup/utils/error';

import { chromeStorage } from '../background/chromeStorage';

export function getAddress(publicKey: Buffer) {
  const uncompressedPublicKey = Buffer.from(TinySecp256k1.pointCompress(publicKey, false).slice(1));
  return toChecksumAddress(Address.fromPublicKey(uncompressedPublicKey).toString());
}

export async function requestRPC<T>(method: string, params: unknown, id?: string | number) {
  const { currentEthereumNetwork } = await chromeStorage();

  const { rpcURL } = currentEthereumNetwork;

  const rpcId = id ?? new Date().getTime();

  try {
    const response = await fetch(rpcURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ method, params, jsonrpc: '2.0', id: rpcId }),
    });

    const responseJSON = (await response.json()) as { id?: number | string };

    if (id === undefined) {
      delete responseJSON?.id;
    }

    return responseJSON as unknown as T;
  } catch {
    throw new EthereumRPCError(RPC_ERROR.INTERNAL, RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL], rpcId);
  }
}

export function sign(data: string, privateKey: Buffer) {
  const message = Buffer.from(stripHexPrefix(data), 'hex');

  const signature = ecsign(message, privateKey);

  const rpcSignature = toRpcSig(signature.v, signature.r, signature.s);

  return rpcSignature;
}

export function personalSign(data: string, privateKey: Buffer) {
  const message = isHexString(data) ? toBuffer(data) : Buffer.from(data);
  const msgHash = hashPersonalMessage(message);

  const signature = ecsign(msgHash, privateKey);

  const rpcSignature = toRpcSig(signature.v, signature.r, signature.s);

  return rpcSignature;
}

export function rpcResponse(result: unknown, id?: number | string) {
  return id !== undefined
    ? {
        result,
        jsonrpc: '2.0',
        id,
      }
    : { result, jsonrpc: '2.0' };
}
