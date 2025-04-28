import type { AptosChain, BitcoinChain, ChainBase, CosmosChain, EvmChain, SuiChain } from '@/types/chain';

export function isCosmosChain(chain?: ChainBase): chain is CosmosChain {
  if (!chain) return false;

  return chain.chainType === 'cosmos';
}

export function isEVMChain(chain?: ChainBase): chain is EvmChain {
  if (!chain) return false;

  return chain.chainType === 'evm';
}

export function isAptosChain(chain?: ChainBase): chain is AptosChain {
  if (!chain) return false;

  return chain.chainType === 'aptos';
}

export function isSuiChain(chain?: ChainBase): chain is SuiChain {
  if (!chain) return false;

  return chain.chainType === 'sui';
}

export function isBitcoinChain(chain?: ChainBase): chain is BitcoinChain {
  if (!chain) return false;

  return chain.chainType === 'bitcoin';
}

export const isTestnetChain = (value?: string | null): boolean => {
  if (!value) return false;
  return value.endsWith('-testnet');
};
