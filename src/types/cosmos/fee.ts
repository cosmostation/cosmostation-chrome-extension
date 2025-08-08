import type { AccountAddress } from '../account';
import type { CosmosAsset, CustomCosmosAsset } from '../asset';
import type { CosmosChain, CustomCosmosChain } from '../chain';

export interface CosmosFeeAsset {
  gasRate: string[];
  chain: CosmosChain;
  asset: CosmosAsset | CustomCosmosAsset;
  address: AccountAddress;
  balance: string;
}

export interface CosmosFeeOption {
  gas: string | undefined;
  gasRate: string;
  coinId: string;
  decimals: number;
  balance: string;
  denom: string | undefined;
  coinGeckoId: string | undefined;
  symbol: string;
  feeAsset:
    | {
        balance: string;
        gasRate: string[];
        chain: CustomCosmosChain;
        asset: CustomCosmosAsset;
        address: AccountAddress;
        lastUpdatedAtMs?: number | null;
      }
    | undefined;
  title: string;
}
