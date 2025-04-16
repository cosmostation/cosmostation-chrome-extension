import { bech32 } from 'bech32';

export function isValidCosmosAddress(address: string, addressPrefix: string): boolean {
  try {
    return bech32.decode(address).prefix === addressPrefix;
  } catch {
    return false;
  }
}

export function convertToValidatorAddress(address?: string, validatorPrefix?: string) {
  if (!address || !validatorPrefix) {
    return undefined;
  }

  const { words } = bech32.decode(address);
  return bech32.encode(validatorPrefix, words);
}

export function getAddressPrefix(address?: string) {
  try {
    if (!address) return address;

    return bech32.decode(address).prefix;
  } catch {
    return undefined;
  }
}
