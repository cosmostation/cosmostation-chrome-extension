import aes from 'crypto-js/aes';
import encHex from 'crypto-js/enc-hex';
import encUtf8 from 'crypto-js/enc-utf8';
import baseSha512 from 'crypto-js/sha512';

export function sha512(message: string) {
  return baseSha512(message).toString(encHex);
}

export function aesEncrypt(message: string, key: string) {
  return aes.encrypt(message, key).toString();
}

export function aesDecrypt(message: string, key: string) {
  return aes.decrypt(message, key).toString(encUtf8);
}

const PRIVATE_KEY_SIZE = 32;
const BN32_ZERO = new Uint8Array(32);
const BN32_N = new Uint8Array([
  255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 254, 186, 174, 220, 230, 175, 72, 160, 59,
  191, 210, 94, 140, 208, 54, 65, 65,
]);

export function isPrivate(x: Uint8Array): boolean {
  return isUint8Array(x) && x.length === PRIVATE_KEY_SIZE && cmpBN32(x, BN32_ZERO) > 0 && cmpBN32(x, BN32_N) < 0;
}

function isUint8Array(value: Uint8Array): boolean {
  return value instanceof Uint8Array;
}

function cmpBN32(data1: Uint8Array, data2: Uint8Array): number {
  for (let i = 0; i < 32; i += 1) {
    if (data1[i] !== data2[i]) {
      return data1[i] < data2[i] ? -1 : 1;
    }
  }
  return 0;
}
