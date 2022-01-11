import type { Chain, CosmosChain, EthereumChain } from '~/types/chain';

export const LINE_TYPE = {
  COSMOS: 'COSMOS',
  ETHEREUM: 'ETHEREUM',
} as const;

export const COSMOS_CHAINS: CosmosChain[] = [
  {
    id: '62a8e13a-3107-40ef-ade4-58de45aa6c1f',
    line: LINE_TYPE.COSMOS,
    chainId: 'cosmoshub-4',
    chainName: 'cosmos',
    restURL: 'https://lcd-cosmos.cosmostation.io',
    baseDenom: 'uatom',
    displayDenom: 'atom',
    decimal: 6,
    bip44: {
      purpose: "44'",
      coinType: "118'",
      account: "0'",
      change: '0',
    },
    bech32Prefix: { address: 'cosmos' },
  },
  {
    id: 'd86e2b4e-e422-4b58-b687-f1de03cde152',
    line: LINE_TYPE.COSMOS,
    chainId: 'irishub-1',
    chainName: 'iris',
    restURL: 'https://lcd-iris.cosmostation.io',
    baseDenom: 'uiris',
    displayDenom: 'iris',
    decimal: 6,
    bip44: {
      purpose: "44'",
      coinType: "118'",
      account: "0'",
      change: '0',
    },
    bech32Prefix: { address: 'iaa' },
  },
];

export const ETHEREUM_CHAINS: EthereumChain[] = [
  {
    id: '33c328b1-2d5f-43f1-ac88-25be1a5abf6c',
    line: LINE_TYPE.ETHEREUM,
    chainId: '1',
    chainName: 'ethereum',
    rpcURL: '61.74.179.193:50001',
    displayDenom: 'ETH',
    explorerURL: 'https://etherscan.io',
    bip44: {
      purpose: "44'",
      coinType: "60'",
      account: "0'",
      change: '0',
    },
  },
];

export const CHAINS = [...COSMOS_CHAINS, ...ETHEREUM_CHAINS];
