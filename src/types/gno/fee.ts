import type { AccountAddress } from '../account';
import type { GnoAsset } from '../asset';
import type { GnoChain } from '../chain';

export interface GnoFeeAsset {
  gasRate: string[];
  chain: GnoChain;
  asset: GnoAsset;
  address: AccountAddress;
  balance: string;
}
