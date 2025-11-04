import { AccountAddress } from '@aptos-labs/ts-sdk';

export function isValidAptosAddress(address: string): boolean {
  return AccountAddress.isValid({ input: address, strict: true }).valid;
}
