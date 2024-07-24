import { ARTELA_TESTNET as COSMOS_ARTELA_TESTNET } from '~/constants/chain/cosmos/artelaTestnet';
import type { EthereumNetwork } from '~/types/chain';

export const ARTELA_TESTNET: EthereumNetwork = {
  id: 'ddf783bb-39ba-49f4-84f6-fbec338f6c0a',
  chainId: '0x2e2e',
  networkName: COSMOS_ARTELA_TESTNET.chainName,
  rpcURL: 'https://rpc-office-evm.cosmostation.io/artela-testnet/',
  tokenImageURL: COSMOS_ARTELA_TESTNET.tokenImageURL,
  imageURL: COSMOS_ARTELA_TESTNET.imageURL,
  displayDenom: COSMOS_ARTELA_TESTNET.displayDenom,
  decimals: COSMOS_ARTELA_TESTNET.decimals,
  explorerURL: 'https://betanet-scan.artela.network',
};
