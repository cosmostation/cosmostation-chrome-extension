import { bech32 } from 'bech32';

export function isValidCosmosAddress(address: string, addressPrefix: string): boolean {
  try {
    return bech32.decode(address).prefix === addressPrefix;
  } catch {
    return false;
  }
}
