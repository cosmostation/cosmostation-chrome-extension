import { Address, toChecksumAddress } from 'ethereumjs-util';
import * as TinySecp256k1 from 'tiny-secp256k1';

export function getAddress(publicKey: Buffer) {
  const fullpublicKey = Buffer.from(TinySecp256k1.pointCompress(publicKey, false).slice(1));
  return toChecksumAddress(Address.fromPublicKey(fullpublicKey).toString());
}
