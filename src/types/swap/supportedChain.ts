import type { CosmosChain, EthereumNetwork } from '../chain';

export type IntegratedSwapChain =
  | (EthereumNetwork & { line: string; supportedApi: string; addressId: string })
  | (CosmosChain & { supportedApi: string; addressId: string; networkName: string });
