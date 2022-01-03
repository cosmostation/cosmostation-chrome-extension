import type { Chain } from '~/types/chain';

export const CHAINS: Chain[] = [
  {
    chainId: 'cosmoshub-4',
    chainName: 'cosmos',
    rest: 'https://lcd-cosmos.cosmostation.io',
    baseDenom: 'uatom',
    displayDenom: 'atom',
    decimal: 6,
    coinType: "118'",
    bech32Prefix: { address: 'cosmos' },
  },
  {
    chainId: 'irishub-1',
    chainName: 'iris',
    rest: 'https://lcd-iris.cosmostation.io',
    baseDenom: 'uiris',
    displayDenom: 'iris',
    decimal: 6,
    coinType: "118'",
    bech32Prefix: { address: 'iaa' },
  },
];
