import type { ChainData } from '@0xsquid/sdk/dist/types';

import type { EthereumNetwork } from '../chain';

export type IntegratedSwapChain = ((EthereumNetwork & { chainType: string }) | (ChainData & { imageURL: string; id: string; chainId: string })) & {
  supportedApi?: string;
};
