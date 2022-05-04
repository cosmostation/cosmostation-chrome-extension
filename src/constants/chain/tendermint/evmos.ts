import { MINTSCAN_URL } from '~/constants/common';
import evmosImg from '~/images/symbols/evmos.png';
import type { TendermintChain } from '~/types/chain';

export const EVMOS: TendermintChain = {
  id: '086983eb-26dd-4792-a4bb-c8b280b854e3',
  line: 'TENDERMINT',
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
    tiny: '2000000000',
    low: '20000000000',
    average: '200000000000',
  },
  gas: { send: '150000' },
};
