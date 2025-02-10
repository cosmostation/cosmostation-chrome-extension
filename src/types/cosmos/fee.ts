import type { AccountAddress } from '../account';
import type { CosmosAsset, CustomCosmosAsset } from '../asset';
import type { CosmosChain } from '../chain';

export interface CosmosFeeAsset {
  gasRate: string[];
  chain: CosmosChain;
  asset: CosmosAsset | CustomCosmosAsset;
  address: AccountAddress;
  balance: string;
}
