import aes from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';

export function aesEncrypt(message: string, key: string) {
  return aes.encrypt(message, key).toString();
}

export function aesDecrypt(message: string, key: string) {
  return aes.decrypt(message, key).toString(encUtf8);
}
