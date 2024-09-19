import { MINTSCAN_URL } from '~/constants/common';
import marsChainImg from '~/images/chainImgs/mars.png';
import marsTokenImg from '~/images/symbols/mars.png';
import type { CosmosChain } from '~/types/chain';

export const MARS: CosmosChain = {
  id: 'acc298c0-ee4f-48e6-bcd5-3b974a553cf7',
  line: 'COSMOS',
  type: '',
  chainId: 'mars-1',
  chainName: 'MARS',
  restURL: 'https://mars-api.polkachu.com',
  tokenImageURL: marsTokenImg,
  imageURL: marsChainImg,
  baseDenom: 'umars',
  displayDenom: 'MARS',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'mars' },
  coinGeckoId: 'mars-protocol-a7fcbcfb-fd61-4017-92f0-7ee9f9cc6da3',
  explorerURL: `${MINTSCAN_URL}/mars-protocol`,
  gasRate: {
    tiny: '0',
    low: '0',
    average: '0',
  },
  gas: {},
};
