import aes from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';

export function aesEncrypt(message: string, key: string) {
  return aes.encrypt(message, key).toString();
}

export function aesDecrypt(message: string, key: string) {
  return aes.decrypt(message, key).toString(encUtf8);
}

export function toUint8Array(input: ArrayBufferLike | number[]): Uint8Array {
  if (Array.isArray(input)) {
    return new Uint8Array(input);
  }
  return new Uint8Array(input);
}
