import { sha3_256 as sha3 } from '@noble/hashes/sha3';
import { bytesToHex } from '@noble/hashes/utils';

export function getAddress(publicKey: Buffer) {
  const hash = sha3.create();
  hash.update(publicKey);
  hash.update('\x00');

  const address = `0x${bytesToHex(hash.digest())}`;

  return address;
}

export function getCoinAddress(type: string) {
  const startIndex = type.indexOf('<');
  const endIndex = type.indexOf('>');

  if (startIndex > -1 && endIndex > -1) {
    return type.substring(startIndex + 1, endIndex);
  }

  return '';
}
