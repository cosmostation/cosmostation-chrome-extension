import { PLANQ as COSMOS_PLANQ } from '~/constants/chain/cosmos/planq';
import type { EthereumNetwork } from '~/types/chain';

export const PLANQ: EthereumNetwork = {
  id: '4ab6b3a4-d33a-4867-b555-c1e733ccce3e',
  chainId: '0x1b9e',
  networkName: COSMOS_PLANQ.chainName,
  rpcURL: 'https://evm-rpc.planq.network',
  tokenImageURL: COSMOS_PLANQ.tokenImageURL,
  imageURL: COSMOS_PLANQ.imageURL,
  displayDenom: COSMOS_PLANQ.displayDenom,
  decimals: COSMOS_PLANQ.decimals,
  explorerURL: COSMOS_PLANQ.explorerURL,
  coinGeckoId: COSMOS_PLANQ.coinGeckoId,
};
