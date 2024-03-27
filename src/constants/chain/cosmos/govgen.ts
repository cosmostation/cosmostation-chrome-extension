import { MINTSCAN_URL } from '~/constants/common';
import govgenImg from '~/images/symbols/govgen.png';
import type { CosmosChain } from '~/types/chain';

export const GOVGEN: CosmosChain = {
  id: '110c75d9-1daa-46dc-a1e2-af0d832a7877',
  line: 'COSMOS',
  type: '',
  chainId: 'govgen-1',
  chainName: 'GovGen',
  restURL: 'https://lcd-govgen.cosmostation.io',
  imageURL: govgenImg,
  baseDenom: 'ugovgen',
  displayDenom: 'GOVGEN',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'govgen' },
  explorerURL: `${MINTSCAN_URL}/govgen`,
  gasRate: {
    tiny: '0.001',
    low: '0.001',
    average: '0.001',
  },
  gas: { send: '100000' },
};
