import { MINTSCAN_URL } from '~/constants/common';
import evmosImg from '~/images/symbols/evmos.png';
import type { CosmosChain } from '~/types/chain';

export const EVMOS: CosmosChain = {
  id: '086983eb-26dd-4792-a4bb-c8b280b854e3',
  isActive: true,
  line: 'COSMOS',
  type: 'ETHERMINT',
  chainId: 'evmos_9001-2',
  chainName: 'Evmos',
  restURL: 'https://lcd-evmos.cosmostation.io',
  imageURL: evmosImg,
  baseDenom: 'aevmos',
  displayDenom: 'EVMOS',
  decimals: 18,
  bip44: {
    purpose: "44'",
    coinType: "60'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'evmos' },
  coinGeckoId: 'evmos',
  explorerURL: `${MINTSCAN_URL}/evmos`,
  gasRate: {
    tiny: '20000000000',
    low: '25000000000',
    average: '30000000000',
  },
  gas: { send: '150000', ibcSend: '180000' },
};
