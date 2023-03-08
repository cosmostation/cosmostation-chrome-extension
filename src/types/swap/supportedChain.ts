import type { CosmosChain, EthereumNetwork } from '../chain';

export type IntegratedSwapEVMChain = EthereumNetwork & { line: 'ETHEREUM'; supportedApi: string; addressId: string };

export type IntegratedSwapCosmosChain = CosmosChain & { supportedApi: string; addressId: string; networkName: string };

export type IntegratedSwapChain = IntegratedSwapEVMChain | IntegratedSwapCosmosChain;
