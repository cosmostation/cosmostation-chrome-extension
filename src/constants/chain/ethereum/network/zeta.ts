import { ZETA as COSMOS_ZETA } from '~/constants/chain/cosmos/zeta';
import type { EthereumNetwork } from '~/types/chain';

export const ZETA: EthereumNetwork = {
  id: 'c1075100-18a3-49b3-b712-1eb3a2f0fbbd',
  chainId: '0x1b58',
  networkName: COSMOS_ZETA.chainName,
  rpcURL: 'https://rpc-zeta-evm.cosmostation.io',
  tokenImageURL: COSMOS_ZETA.tokenImageURL,
  imageURL: COSMOS_ZETA.imageURL,
  displayDenom: COSMOS_ZETA.displayDenom,
  decimals: COSMOS_ZETA.decimals,
  explorerURL: COSMOS_ZETA.explorerURL,
  coinGeckoId: COSMOS_ZETA.coinGeckoId,
};
