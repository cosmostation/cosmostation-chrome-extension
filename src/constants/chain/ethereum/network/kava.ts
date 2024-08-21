import { KAVA as COSMOS_KAVA } from '~/constants/chain/cosmos/kava';
import type { EthereumNetwork } from '~/types/chain';

export const KAVA: EthereumNetwork = {
  id: '94c8a91b-258c-44ea-88b0-4e03b3257434',
  chainId: '0x8ae',
  networkName: 'KAVA EVM',
  rpcURL: 'https://rpc-kava-evm.cosmostation.io',
  tokenImageURL: COSMOS_KAVA.tokenImageURL,
  imageURL: COSMOS_KAVA.imageURL,
  displayDenom: COSMOS_KAVA.displayDenom,
  decimals: 18,
  explorerURL: 'https://kavascan.io',
  coinGeckoId: COSMOS_KAVA.coinGeckoId,
};
