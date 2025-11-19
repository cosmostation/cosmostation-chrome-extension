import validate, { Network } from 'bitcoin-address-validation';
import { isValidAddress } from 'ethereumjs-util';
import { isValidIotaAddress } from '@iota/iota-sdk/utils';
import { isValidSuiAddress } from '@mysten/sui/utils';

import type { BitcoinChain, ChainBase, ChainType, CosmosChain, GnoChain } from '@/types/chain';

import { isValidAptosAddress } from '../aptos/validation';
import { isValidCosmosAddress } from '../cosmos/address';
import { isValidSolanaAddress } from '../solana/validation';

type AddressValidator = (address: string, chain: ChainBase) => boolean;

const addressValidators: Record<ChainType, AddressValidator> = {
  cosmos: (address, chain) => {
    const chainCasted = chain as CosmosChain;
    return isValidCosmosAddress(address, chainCasted.accountPrefix);
  },

  evm: (address) => {
    return isValidAddress(address);
  },

  aptos: (address) => {
    return isValidAptosAddress(address);
  },

  sui: (address) => {
    return isValidSuiAddress(address);
  },

  iota: (address) => {
    return isValidIotaAddress(address);
  },

  bitcoin: (address, chain) => {
    const currentBitcoinChain = chain as BitcoinChain;
    const network = currentBitcoinChain.isTestnet ? Network.testnet : Network.mainnet;
    return validate(address, network);
  },

  solana: (address) => {
    return isValidSolanaAddress(address);
  },

  gno: (address, chain) => {
    const chainCasted = chain as GnoChain;
    return isValidCosmosAddress(address, chainCasted.accountPrefix);
  },
};

export const isChainAddressValid = (address: string, chain: ChainBase): boolean => {
  const chainType = chain?.chainType;

  const addressValidator = addressValidators[chainType];

  if (!addressValidator) {
    return false;
  }

  return addressValidator(address, chain);
};
