import { MINTSCAN_URL } from '~/constants/common';
import gravitybridgeImg from '~/images/symbols/gravitybridge.png';
import type { TendermintChain } from '~/types/chain';

export const GRAVITY_BRIDGE: TendermintChain = {
  id: 'f21c887b-08ec-42dc-b907-aeaf5113d9f4',
  line: 'TENDERMINT',
  type: '',
  chainId: 'gravity-bridge-3',
  chainName: 'Gravity Bridge',
  restURL: 'https://lcd-gravity-bridge.cosmostation.io',
  imageURL: gravitybridgeImg,
  baseDenom: 'ugraviton',
  displayDenom: 'graviton',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'gravity' },
  explorerURL: `${MINTSCAN_URL}/gravity-bridge`,
  coinGeckoId: 'graviton',
  gasRate: {
    tiny: '0',
    low: '0.025',
    average: '0.25',
  },
  gas: { send: '100000' },
};
