import { bech32 } from 'bech32';

import { DEFAULT_FETCH_TIME_OUT_MS } from '@/constants/common';
import type { CosmosValidator } from '@/types/cosmos/validator';

import { get } from '../axios';
import { removeTrailingSlash } from '../string';

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

export async function isValidatorAddress(address: string, lcdUrl: string): Promise<boolean> {
  const base = removeTrailingSlash(lcdUrl);
  const url = `${base}/cosmos/staking/v1beta1/validators/${address}`;
  try {
    const response = await get<{
      validator: CosmosValidator;
    }>(url, {
      timeout: DEFAULT_FETCH_TIME_OUT_MS,
    });
    return !!response.validator;
  } catch {
    return false;
  }
}
