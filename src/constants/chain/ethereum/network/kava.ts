import { KAVA as COSMOS_KAVA } from '~/constants/chain/cosmos/kava';
import type { EthereumNetwork } from '~/types/chain';

export const KAVA: EthereumNetwork = {
  id: '94c8a91b-258c-44ea-88b0-4e03b3257434',
  chainId: '0x8ae',
  networkName: 'Kava EVM',
  rpcURL: 'https://rpc-kava-evm.cosmostation.io',
  imageURL: COSMOS_KAVA.imageURL,
  displayDenom: COSMOS_KAVA.displayDenom,
  decimals: 18,
  explorerURL: 'https://mintscan.io/kava',
  coinGeckoId: COSMOS_KAVA.coinGeckoId,
};
