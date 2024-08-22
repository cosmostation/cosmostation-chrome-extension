import { CANTO as COSMOS_CANTO } from '~/constants/chain/cosmos/canto';
import type { EthereumNetwork } from '~/types/chain';

export const CANTO: EthereumNetwork = {
  id: 'd25243d2-cf65-4768-bbc0-ec439683568d',
  chainId: '0x1e14',
  networkName: COSMOS_CANTO.chainName,
  rpcURL: 'https://canto.slingshot.finance',
  tokenImageURL: COSMOS_CANTO.tokenImageURL,
  imageURL: COSMOS_CANTO.imageURL,
  displayDenom: COSMOS_CANTO.displayDenom,
  decimals: COSMOS_CANTO.decimals,
  explorerURL: COSMOS_CANTO.explorerURL,
  coinGeckoId: COSMOS_CANTO.coinGeckoId,
};
