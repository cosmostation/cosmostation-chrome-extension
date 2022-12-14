import { Ed25519PublicKey } from '@mysten/sui.js';

import type { GetObject, GetObjectExists, Result } from '~/types/sui/rpc';

export function getAddress(publicKey: Buffer) {
  const key = new Ed25519PublicKey(publicKey);

  return `0x${key.toSuiAddress()}`;
}

export function isExists(object: Result<GetObject>): object is Result<GetObjectExists> {
  return object.result?.status === 'Exists';
}

export function getCoinAddress(type: string) {
  const startIndex = type.indexOf('<');
  const endIndex = type.indexOf('>');

  if (startIndex > -1 && endIndex > -1) {
    return type.substring(startIndex + 1, endIndex);
  }

  return '';
}
