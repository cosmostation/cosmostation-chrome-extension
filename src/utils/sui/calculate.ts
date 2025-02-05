import type { TransactionEffects } from '@mysten/sui/client';

import { minus, plus } from '../numbers';

export function getTotalGasUsed(effects?: TransactionEffects | null) {
  const gasSummary = effects?.gasUsed;
  if (!gasSummary) return '0';
  return minus(plus(gasSummary.computationCost, gasSummary.storageCost), gasSummary.storageRebate);
}
