import type { AccountAddress, AssetIdentifiers } from '../account';
import type { GnoAsset } from '../asset';
import type { GnoChain } from '../chain';

export interface GnoFeeAsset extends AssetIdentifiers {
  gasRate: string[];
  chain: GnoChain;
  asset: GnoAsset;
  address: AccountAddress;
  balance: string;
}
