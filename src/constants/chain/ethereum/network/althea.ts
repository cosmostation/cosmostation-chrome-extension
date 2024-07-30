import { ALTHEA as COSMOS_ALTHEA } from '~/constants/chain/cosmos/althea';
import { MINTSCAN_URL } from '~/constants/common';
import type { EthereumNetwork } from '~/types/chain';

export const ALTHEA: EthereumNetwork = {
  id: '337cd8d0-fedc-4ce0-befc-d756d1e92abb',
  chainId: '0x3f180',
  networkName: COSMOS_ALTHEA.chainName,
  rpcURL: 'https://rpc-althea-evm.cosmostation.io',
  tokenImageURL: COSMOS_ALTHEA.tokenImageURL,
  imageURL: COSMOS_ALTHEA.imageURL,
  displayDenom: COSMOS_ALTHEA.displayDenom,
  decimals: COSMOS_ALTHEA.decimals,
  explorerURL: `${MINTSCAN_URL}/althea`,
  coinGeckoId: COSMOS_ALTHEA.coinGeckoId,
};
