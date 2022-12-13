import { Ed25519PublicKey } from '@mysten/sui.js';

export function getAddress(publicKey: Buffer) {
  const key = new Ed25519PublicKey(publicKey);

  return `0x${key.toSuiAddress()}`;
}
