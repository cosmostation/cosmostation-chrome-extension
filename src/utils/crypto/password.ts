import encHex from 'crypto-js/enc-hex';
import baseSha512 from 'crypto-js/sha512';

export function sha512(message: string) {
  return baseSha512(message).toString(encHex);
}
