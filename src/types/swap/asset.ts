import type { TokenData } from '@0xsquid/sdk/dist/types';

import type { Token } from '../1inch/swap';
import type { CosmosChain, EthereumNetwork } from '../chain';
import type { AssetV3 } from '../cosmos/asset';

export type IntegratedSwapEVMChain = EthereumNetwork & { line: 'ETHEREUM'; supportedApi: string; addressId: string };

export type IntegratedSwapCosmosChain = CosmosChain & { supportedApi: string; addressId: string; networkName: string };

export type IntegratedSwapChain = IntegratedSwapEVMChain | IntegratedSwapCosmosChain;

export type IntegratedSwapCosmosToken = AssetV3 & {
  name: string;
  denom: string;
  availableAmount?: string;
  coingeckoId?: string;
  logoURI?: string;
  address?: string;
};

export type IntegratedSwapEVMToken = (Token | TokenData) & { coingeckoId?: string; availableAmount?: string; denom?: string };

export type IntegratedSwapToken = IntegratedSwapEVMToken | IntegratedSwapCosmosToken;
