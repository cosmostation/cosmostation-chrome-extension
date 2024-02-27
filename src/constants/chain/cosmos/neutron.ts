import { MINTSCAN_URL } from '~/constants/common';
import neutronChainImg from '~/images/chainImgs/neutron.png';
import neutronTokenImg from '~/images/symbols/ntrn.png';
import type { CosmosChain } from '~/types/chain';

export const NEUTRON: CosmosChain = {
  id: '04c17220-88ee-478c-84c8-44c716b8562e',
  line: 'COSMOS',
  type: '',
  chainId: 'neutron-1',
  chainName: 'NEUTRON',
  restURL: 'https://lcd-neutron.cosmostation.io',
  tokenImageURL: neutronTokenImg,
  imageURL: neutronChainImg,
  baseDenom: 'untrn',
  displayDenom: 'NTRN',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'neutron' },
  explorerURL: `${MINTSCAN_URL}/neutron`,
  coinGeckoId: 'neutron-3',
  gasRate: {
    tiny: '0.025',
    low: '0.025',
    average: '0.025',
  },
  gas: { send: '100000' },
  custom: 'no-stake',
};
