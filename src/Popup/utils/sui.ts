import { sha3_256 as sha3 } from '@noble/hashes/sha3';
import { bytesToHex } from '@noble/hashes/utils';

export function getAddress(publicKey: Buffer) {
  const hash = sha3.create();
  hash.update(publicKey);
  hash.update('\x00');

  const address = `0x${bytesToHex(hash.digest())}`;

  return address;
}
