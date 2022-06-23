import { EVMOS as TENDERMINT_EVMOS } from '~/constants/chain/tendermint/evmos';
import type { EthereumNetwork } from '~/types/chain';

export const EVMOS: EthereumNetwork = {
  id: '0bf79991-a0ec-4745-8f7b-bc15233979f2',
  chainId: '0x2329',
  networkName: TENDERMINT_EVMOS.chainName,
  rpcURL: 'https://rpc-evmos-app.cosmostation.io',
  imageURL: TENDERMINT_EVMOS.imageURL,
  displayDenom: TENDERMINT_EVMOS.displayDenom,
  decimals: TENDERMINT_EVMOS.decimals,
  explorerURL: 'https://mintscan.io/evmos',
  coinGeckoId: TENDERMINT_EVMOS.coinGeckoId,
};
