import { MINTSCAN_URL } from '~/constants/common';
import certikImg from '~/images/symbols/certik.png';
import type { TendermintChain } from '~/types/chain';

export const CERTIK: TendermintChain = {
  id: '29d61a8d-6bbe-4524-afa5-6f70931bcdee',
  line: 'TENDERMINT',
  type: '',
  chainId: 'shentu-2.2',
  chainName: 'Certik',
  restURL: 'https://lcd-certik.cosmostation.io',
  imageURL: certikImg,
  baseDenom: 'uctk',
  displayDenom: 'ctk',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'certik' },
  coinGeckoId: 'certik',
  explorerURL: `${MINTSCAN_URL}/certik`,
  gasRate: {
    tiny: '0.05',
    low: '0.05',
    average: '0.05',
  },
  gas: { send: '100000' },
};
