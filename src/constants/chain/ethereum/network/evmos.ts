import { EVMOS as COSMOS_EVMOS } from '~/constants/chain/cosmos/evmos';
import type { EthereumNetwork } from '~/types/chain';

export const EVMOS: EthereumNetwork = {
  id: '0bf79991-a0ec-4745-8f7b-bc15233979f2',
  chainId: '0x2329',
  networkName: COSMOS_EVMOS.chainName,
  rpcURL: 'https://rpc-evmos-evm.cosmostation.io',
  imageURL: COSMOS_EVMOS.imageURL,
  displayDenom: COSMOS_EVMOS.displayDenom,
  decimals: COSMOS_EVMOS.decimals,
  explorerURL: 'https://mintscan.io/evmos',
  coinGeckoId: COSMOS_EVMOS.coinGeckoId,
};
