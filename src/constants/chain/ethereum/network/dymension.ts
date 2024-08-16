import { DYMENSION as COSMOS_DYMENSION } from '~/constants/chain/cosmos/dymension';
import { MINTSCAN_URL } from '~/constants/common';
import type { EthereumNetwork } from '~/types/chain';

export const DYMENSION: EthereumNetwork = {
  id: '1ee8fa80-ccaa-4046-8640-a4c740b5e003',
  chainId: '0x44c',
  networkName: COSMOS_DYMENSION.chainName,
  rpcURL: 'https://rpc-dymension-evm.cosmostation.io',
  tokenImageURL: COSMOS_DYMENSION.tokenImageURL,
  imageURL: COSMOS_DYMENSION.imageURL,
  displayDenom: COSMOS_DYMENSION.displayDenom,
  decimals: COSMOS_DYMENSION.decimals,
  explorerURL: `${MINTSCAN_URL}/dymension`,
  coinGeckoId: COSMOS_DYMENSION.coinGeckoId,
};
