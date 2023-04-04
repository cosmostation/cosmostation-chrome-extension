import type { TokenData } from '@0xsquid/sdk/dist/types';

import type { Token } from '../1inch/swap';
import type { CosmosChain, EthereumNetwork } from '../chain';
import type { AssetV3 } from '../cosmos/asset';

export type IntegratedSwapEVMChain = EthereumNetwork & { line: 'ETHEREUM'; addressId: string; baseDenom?: string };

export type IntegratedSwapCosmosChain = CosmosChain & { addressId: string; networkName: string };

export type IntegratedSwapChain = IntegratedSwapEVMChain | IntegratedSwapCosmosChain;

export type IntegratedSwapCosmosToken = AssetV3 & {
  address: string;
  name: string;
  balance?: string;
  logoURI?: string;
};

export type IntegratedSwapEVMToken = (Token | TokenData) & { balance?: string; coinGeckoId?: string };

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
