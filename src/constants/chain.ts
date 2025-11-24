import type { ChainType } from '@/types/chain';

const CHAIN_TYPES_RECORD: Record<ChainType, true> = {
  cosmos: true,
  evm: true,
  bitcoin: true,
  aptos: true,
  sui: true,
  iota: true,
  gno: true,
  solana: true,
};

export const CHAIN_TYPES_KEYS = Object.keys(CHAIN_TYPES_RECORD) as ChainType[];
