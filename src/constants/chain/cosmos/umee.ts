import { MINTSCAN_URL } from '~/constants/common';
import umeeChainImg from '~/images/chainImgs/ux.png';
import umeeTokenImg from '~/images/symbols/ux.png';
import type { CosmosChain } from '~/types/chain';

// NOTE 체인 이름 ux로 바꾸면 ibc랑 네임 맵핑 필요할 수 있음
export const UMEE: CosmosChain = {
  id: '760481cc-5a53-42dd-a805-c7f38c363114',
  line: 'COSMOS',
  type: '',
  chainId: 'umee-1',
  chainName: 'UMEE',
  restURL: 'https://lcd-umee.cosmostation.io',
  tokenImageURL: umeeTokenImg,
  imageURL: umeeChainImg,
  baseDenom: 'uumee',
  displayDenom: 'UMEE',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "118'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'umee' },
  coinGeckoId: 'umee',
  explorerURL: `${MINTSCAN_URL}/umee`,
  gasRate: {
    tiny: '0',
    low: '0.001',
    average: '0.005',
  },
  gas: { send: '100000' },
};
