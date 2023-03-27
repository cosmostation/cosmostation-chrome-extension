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
  availableAmount?: string;
  logoURI?: string;
};

export type IntegratedSwapEVMToken = (Token | TokenData) & { availableAmount?: string; coinGeckoId?: string };

export type IntegratedSwapToken = IntegratedSwapEVMToken | IntegratedSwapCosmosToken;
