import { MINTSCAN_URL } from '~/constants/common';
import initiaChainImg from '~/images/chainImgs/initia.png';
import initiaTokenImg from '~/images/symbols/init.png';
import type { CosmosChain } from '~/types/chain';

export const INITIA: CosmosChain = {
  id: '6de04648-381f-4aa2-b976-8c483fb6784c',
  line: 'COSMOS',
  type: 'ETHERMINT',
  chainId: 'interwoven-1',
  chainName: 'INITIA',
  restURL: 'https://lcd.initia.mainnet.cosmostation.io',
  tokenImageURL: initiaTokenImg,
  imageURL: initiaChainImg,
  baseDenom: 'uinit',
  displayDenom: 'INIT',
  decimals: 6,
  bip44: {
    purpose: "44'",
    coinType: "60'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'init' },
  coinGeckoId: 'initia',
  explorerURL: `${MINTSCAN_URL}/initia`,
  gasRate: {
    tiny: '0',
    low: '0',
    average: '0',
  },
  gas: { send: '150000', ibcSend: '180000' },
  custom: 'no-stake',
};
