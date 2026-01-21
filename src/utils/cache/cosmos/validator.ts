import { convertToValidatorAddress, isValidatorAddress } from '@/utils/cosmos/address';

const validatorAddressCache = new Map<string, boolean>();

export async function isValidatorCached(address: string, lcdUrl: string, validatorPrefix?: string): Promise<boolean> {
  if (validatorAddressCache.has(address)) {
    return validatorAddressCache.get(address)!;
  }

  const validatorAddress = convertToValidatorAddress(address, validatorPrefix);

  const isValidator = validatorAddress ? await isValidatorAddress(validatorAddress, lcdUrl) : false;

  validatorAddressCache.set(address, isValidator);
  return isValidator;
}
