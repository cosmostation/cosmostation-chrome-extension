import { MINTSCAN_URL } from '~/constants/common';
import gravitybridgeChainImg from '~/images/chainImgs/gravitybridge.png';
import gravitybridgeTokenImg from '~/images/symbols/graviton.png';
import type { CosmosChain } from '~/types/chain';

export const GRAVITY_BRIDGE: CosmosChain = {
  id: 'f21c887b-08ec-42dc-b907-aeaf5113d9f4',
  line: 'COSMOS',
  type: '',
  chainId: 'gravity-bridge-3',
  chainName: 'GRAVITY BRIDGE',
  restURL: 'https://lcd-gravity-bridge.cosmostation.io',
  tokenImageURL: gravitybridgeTokenImg,
  imageURL: gravitybridgeChainImg,
  baseDenom: 'ugraviton',
  displayDenom: 'GRAVITON',
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
