import { XPLA as COSMOS_XPLA } from '~/constants/chain/cosmos/xpla';
import type { EthereumNetwork } from '~/types/chain';

export const XPLA: EthereumNetwork = {
  id: '587f2cf2-0d2f-483d-aeaa-ab18fb0a1584',
  chainId: '0x25',
  networkName: COSMOS_XPLA.chainName,
  rpcURL: 'https://rpc-xpla-evm.cosmostation.io',
  tokenImageURL: COSMOS_XPLA.tokenImageURL,
  imageURL: COSMOS_XPLA.imageURL,
  displayDenom: COSMOS_XPLA.displayDenom,
  decimals: COSMOS_XPLA.decimals,
  explorerURL: COSMOS_XPLA.explorerURL,
  coinGeckoId: COSMOS_XPLA.coinGeckoId,
};
