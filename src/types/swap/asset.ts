import type { CosmosChain, EthereumNetwork, EthereumToken } from '../chain';
import type { AssetV3 } from '../cosmos/asset';

export type IntegratedSwapEVMChain = EthereumNetwork & { line: 'ETHEREUM'; baseChainUUID: string };

export type IntegratedSwapCosmosChain = CosmosChain & { baseChainUUID: string; networkName: string };

export type IntegratedSwapChain = IntegratedSwapEVMChain | IntegratedSwapCosmosChain;

export type IntegratedSwapCosmosToken = AssetV3 & {
  address: string;
  balance?: string;
  displayDenom: string;
  imageURL?: string;
  name: string;
};

export type IntegratedSwapEVMToken = Omit<EthereumToken, 'id' | 'ethereumNetworkId' | 'tokenType'> & {
  balance?: string;
  name: string;
};

export type IntegratedSwapToken = IntegratedSwapEVMToken | IntegratedSwapCosmosToken;

export type SupportSwapChainPayload = {
  oneInch: SupportedChain;
  squid: SupportedChain;
};

export type SupportedChain = {
  evm: ChainData;
  cosmos: ChainData;
};

export type ChainData = {
  send: ChainIdData[];
  receive: ChainIdData[];
};

export type ChainIdData = {
  chainId: string;
};
