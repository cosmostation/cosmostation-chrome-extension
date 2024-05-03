import { MINTSCAN_URL } from '~/constants/common';
import sentinelChainImg from '~/images/chainImgs/sentinel.png';
import sentinelTokenImg from '~/images/symbols/dvpn.png';
import type { CosmosChain } from '~/types/chain';

export const SENTINEL: CosmosChain = {
  id: '8c72318f-8279-4d37-a457-1cd4c0b1f160',
  line: 'COSMOS',
  type: '',
  chainId: 'sentinelhub-2',
  chainName: 'SENTINEL',
  restURL: 'https://lcd-sentinel.cosmostation.io',
  tokenImageURL: sentinelTokenImg,
  imageURL: sentinelChainImg,
  baseDenom: 'udvpn',
  displayDenom: 'DVPN',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'sent' },
  coinGeckoId: 'sentinel',
  explorerURL: `${MINTSCAN_URL}/sentinel`,
  gasRate: {
    tiny: '0.01',
    low: '0.1',
    average: '0.1',
  },
  gas: { send: '100000' },
};
