import encHex from 'crypto-js/enc-hex';
import sha256 from 'crypto-js/sha256';
import ecc from '@bitcoinerlab/secp256k1';

export function signMessage(message: string, privateKey: Buffer) {
  const sha256Message = sha256(message).toString(encHex);

  const messageBuffer = Buffer.from(sha256Message, 'hex');

  const signatureBuffer = ecc.sign(messageBuffer, privateKey);

  return signatureBuffer;
}
