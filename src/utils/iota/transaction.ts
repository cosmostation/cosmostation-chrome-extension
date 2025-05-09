import type { IotaTransactionBlockResponse } from '@iota/iota-sdk/client';

import addressOwner from './addressOwner';
import { equal } from '../numbers';

export type FindBalanceChangeProps = {
  balanceChanges: IotaTransactionBlockResponse['balanceChanges'];
  value?: string;
  ownerAddress?: string;
};

export function findBalanceChanges({ balanceChanges, value, ownerAddress }: FindBalanceChangeProps) {
  let filtered = balanceChanges;

  if (!filtered) return [];

  if (value !== undefined) {
    filtered = filtered.filter((balanceChange) => equal(balanceChange.amount, value));
  }

  if (ownerAddress) {
    filtered = filtered.filter((balanceChange) => (balanceChange.owner ? addressOwner(balanceChange.owner) === ownerAddress : false));
  }

  return filtered;
}
