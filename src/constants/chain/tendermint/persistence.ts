import { MINTSCAN_URL } from '~/constants/common';
import persistenceImg from '~/images/symbols/persistence.png';
import type { TendermintChain } from '~/types/chain';

export const PERSISTENCE: TendermintChain = {
  id: '58c55107-2df3-4851-a68e-fee203308be2',
  line: 'TENDERMINT',
  type: '',
  chainId: 'core-1',
  chainName: 'Persistence',
  restURL: 'https://lcd-persistence.cosmostation.io',
  imageURL: persistenceImg,
  baseDenom: 'uxprt',
  displayDenom: 'xprt',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "750'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'persistence' },
  coinGeckoId: 'persistence',
  explorerURL: `${MINTSCAN_URL}/persistence`,
  gasRate: {
    tiny: '0',
    low: '0',
    average: '0',
  },
  gas: { send: '100000' },
};
