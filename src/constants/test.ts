import type { Chain } from '@/types/chain';

// TODO - Need to erase
export const TEST_CHAIN_LIST: Chain[] = [
  {
    id: 'cosmos-unique-id',
    chainType: 'cosmos',
    chainId: 'cosmos',
    name: 'Cosmos',
    image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    mainAssetDenom: 'ATOM',
    accountPrefix: 'cosmos',
    isCosmwasm: false,
    isEvm: false,
    lcdUrls: [
      {
        url: 'https://lcd.terra.dev',
        provider: 'Terra',
      },
    ],
    explorer: null,
    feeInfo: {
      isSimulable: true,
      gasRate: ['0.15uusd'],
      defaultGasLimit: '200000',
      gasCoefficient: 1.25,
    },
    accountTypes: [],
  },
  {
    id: 'ethereum-unique-id',
    chainType: 'evm',
    chainId: 'ethereum',
    name: 'Ethereum',
    image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    mainAssetDenom: '0xEE',
    isCosmos: false,
    feeInfo: {
      isEip1559: true,
      gasCoefficient: 1.25,
    },
    rpcUrls: [
      {
        url: 'https://mainnet.infura.io/v3/your-infura-id',
        provider: 'Infura',
      },
    ],
    accountTypes: [],
    explorer: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
      account: '/address',
      tx: '/tx',
      proposal: '',
    },
  },
];
