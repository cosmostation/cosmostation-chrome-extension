import type { Network } from 'bitcoinjs-lib';
import { payments } from 'bitcoinjs-lib';

export function getAddress(publicKey: Buffer, network?: Network) {
  const p2wpkh = payments.p2wpkh({ pubkey: publicKey, network });
  return p2wpkh.address!;
}
