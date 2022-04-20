import { MINTSCAN_URL } from '~/constants/common';
import provenanceImg from '~/images/symbols/provenance.png';
import type { TendermintChain } from '~/types/chain';

export const PROVENANCE: TendermintChain = {
  id: 'b2326658-5a8b-4bfd-a852-b7ff3859f08c',
  line: 'TENDERMINT',
  type: '',
  chainId: 'pio-mainnet-1',
  chainName: 'Provenance',
  restURL: 'https://lcd-provenance.cosmostation.io',
  imageURL: provenanceImg,
  baseDenom: 'nhash',
  displayDenom: 'hash',
  decimals: 9,
  bip44: {
    purpose: "44'",
    coinType: "505'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'pb' },
  coinGeckoId: 'provenance',
  explorerURL: `${MINTSCAN_URL}/provenance`,
  gasRate: {
    tiny: '2000',
    low: '2000',
    average: '2000',
  },
  gas: { send: '200000' },
};
