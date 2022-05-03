import { Address, ecsign, hashPersonalMessage, isHexString, stripHexPrefix, toBuffer, toChecksumAddress, toRpcSig } from 'ethereumjs-util';
import * as TinySecp256k1 from 'tiny-secp256k1';

export function toHex(data: string) {
  if (data.startsWith('0x')) {
    return data;
  }

  return `0x${Buffer.from(data, 'utf8').toString('hex')}`;
}

export function toUTF8(hex: string) {
  return Buffer.from(stripHexPrefix(hex), 'hex').toString('utf8');
}

export function getAddress(publicKey: Buffer) {
  const uncompressedPublicKey = Buffer.from(TinySecp256k1.pointCompress(publicKey, false).slice(1));
  return toChecksumAddress(Address.fromPublicKey(uncompressedPublicKey).toString());
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
