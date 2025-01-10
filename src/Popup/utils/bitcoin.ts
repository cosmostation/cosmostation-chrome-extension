import type { Network } from 'bitcoinjs-lib';
import { payments, Psbt } from 'bitcoinjs-lib';

export function getAddress(publicKey: Buffer, network?: Network) {
  const p2wpkh = payments.p2wpkh({ pubkey: publicKey, network });
  return p2wpkh.address!;
}

export function formatPsbtHex(psbtHex: string) {
  let formatData = '';
  try {
    if (!/^[0-9a-fA-F]+$/.test(psbtHex)) {
      formatData = Psbt.fromBase64(psbtHex).toHex();
    } else {
      Psbt.fromHex(psbtHex);
      formatData = psbtHex;
    }
  } catch (e) {
    throw new Error('invalid psbt');
  }
  return formatData;
}
