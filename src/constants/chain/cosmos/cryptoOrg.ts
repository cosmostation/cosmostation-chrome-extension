import { MINTSCAN_URL } from '~/constants/common';
import cryptocomImg from '~/images/symbols/cryptocom.png';
import type { CosmosChain } from '~/types/chain';

export const CRYPTO_ORG: CosmosChain = {
  id: 'b006dccc-ff1e-4c5a-95ad-94f313029d93',
  line: 'COSMOS',
  type: '',
  chainId: 'crypto-org-chain-mainnet-1',
  chainName: 'Crypto.org',
  restURL: 'https://lcd-cryptocom.cosmostation.io',
  imageURL: cryptocomImg,
  baseDenom: 'basecro',
  displayDenom: 'CRO',
  decimals: 8,
  bip44: {
    purpose: "44'",
    coinType: "394'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'cro' },
  coinGeckoId: 'crypto-com-chain',
  explorerURL: `${MINTSCAN_URL}/crypto-org`,
  gasRate: {
    tiny: '0.025',
    low: '0.05',
    average: '0.075',
  },
  gas: { send: '100000' },
};
