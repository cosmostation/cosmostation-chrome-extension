import { ecsign, hashPersonalMessage, isHexString, stripHexPrefix, toBuffer, toRpcSig } from 'ethereumjs-util';
import type { TransactionRequest } from 'ethers';
import { ethers } from 'ethers';
import type { MessageTypes, SignTypedDataVersion, TypedMessage } from '@metamask/eth-sig-util';
import { signTypedData as baseSignTypedData } from '@metamask/eth-sig-util';

import type { CustomTypedMessage } from '@/types/message/inject/evm';

import { ethersProvider } from './ethers';
import { toHex } from '../string';

export async function signAndExecuteTxSequentially(privateKey: string, transaction: TransactionRequest, urls: string[]) {
  for (const url of urls) {
    try {
      const provider = ethersProvider(url);

      const signer = new ethers.Wallet(privateKey, provider);

      const response = await signer.sendTransaction(transaction);

      return response;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
    } catch (_) {}
  }
  throw new Error('All RPC URLs failed');
}

export async function signTxSequentially(privateKey: string, transaction: TransactionRequest, urls: string[]) {
  for (const url of urls) {
    try {
      const provider = ethersProvider(url);

      const signer = new ethers.Wallet(privateKey, provider);

      const response = await signer.signTransaction(transaction);

      return response;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
    } catch (_) {}
  }
  throw new Error('All RPC URLs failed');
}

export function signTypedData<T extends MessageTypes>(
  privateKey: Buffer,
  data: CustomTypedMessage<T>,
  version: SignTypedDataVersion.V3 | SignTypedDataVersion.V4,
) {
  const dataToSign = (data.domain.salt ? { ...data, domain: { ...data.domain, salt: Buffer.from(toHex(data.domain.salt), 'hex') } } : data) as TypedMessage<T>;
  return baseSignTypedData({ privateKey, data: dataToSign, version });
}

export function signMessage(data: string, privateKey: string) {
  const message = Buffer.from(stripHexPrefix(data), 'hex');

  const privateKeyBuffer = Buffer.from(privateKey, 'hex');
  const signature = ecsign(message, privateKeyBuffer);

  const rpcSignature = toRpcSig(signature.v, signature.r, signature.s);

  return rpcSignature;
}

export function personalSign(data: string, privateKey: string) {
  const message = isHexString(data) ? toBuffer(data) : Buffer.from(data);
  const msgHash = hashPersonalMessage(message);

  const privateKeyBuffer = Buffer.from(privateKey, 'hex');
  const signature = ecsign(msgHash, privateKeyBuffer);

  const rpcSignature = toRpcSig(signature.v, signature.r, signature.s);

  return rpcSignature;
}
