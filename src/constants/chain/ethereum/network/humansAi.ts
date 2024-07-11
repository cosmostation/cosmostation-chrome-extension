import { HUMANS_AI as COSMOS_HUMANS_AI } from '~/constants/chain/cosmos/humansAi';
import type { EthereumNetwork } from '~/types/chain';

export const HUMANS_AI: EthereumNetwork = {
  id: '234b620d-eae5-4718-a830-8bcad4ddad46',
  chainId: '0x441',
  networkName: COSMOS_HUMANS_AI.chainName,
  rpcURL: 'https://rpc-humans-evm.cosmostation.io',
  tokenImageURL: COSMOS_HUMANS_AI.tokenImageURL,
  imageURL: COSMOS_HUMANS_AI.imageURL,
  displayDenom: COSMOS_HUMANS_AI.displayDenom,
  decimals: COSMOS_HUMANS_AI.decimals,
  explorerURL: COSMOS_HUMANS_AI.explorerURL,
  coinGeckoId: COSMOS_HUMANS_AI.coinGeckoId,
};
