import { bech32 } from 'bech32';

import { DEFAULT_FETCH_TIME_OUT_MS } from '@/constants/common';
import type { CosmosValidator } from '@/types/cosmos/validator';

import { get } from '../axios';
import { buildRequestUrl } from '../fetch';

export function isValidCosmosAddress(address: string, blockchainPrefix: string): boolean {
  if (!address.startsWith(blockchainPrefix)) return false;

  const payload = address.slice(blockchainPrefix.length);
  const validAddressLengths = [39, 59];

  const isWrongAddressLength = !validAddressLengths.includes(payload.length);
  if (isWrongAddressLength) return false;

  return isBech32(address, blockchainPrefix);
}

function isBech32(value: string, prefix: string): boolean {
  try {
    const words = bech32.decode(value);
    return words.prefix === prefix;
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
  const url = buildRequestUrl(lcdUrl, `/cosmos/staking/v1beta1/validators/${address}`);

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
