import type { Draft } from 'immer';
import { produce } from 'immer';

import type {
  AccountAddressBalanceAptosV2,
  AccountAddressBalanceBitcoin,
  AccountAddressBalanceCosmos,
  AccountAddressBalanceCw20,
  AccountAddressBalanceErc20,
  AccountAddressBalanceEvm,
  AccountAddressBalanceGno,
  AccountAddressBalanceGrc20,
  AccountAddressBalanceIota,
  AccountAddressBalanceSui,
  AccountAddressCommissionsCosmos,
  AccountAddressDelegationsCosmos,
  AccountAddressDelegationsIota,
  AccountAddressDelegationsSui,
  AccountAddressRewardsCosmos,
  AccountAddressUnbondingsCosmos,
} from '@/types/account';

import { isEqualsIgnoringCase } from './string';

interface UpsertItemBase {
  address: string;
  chainId: string | number;
  chainType: string;
  id: string;
  lastUpdatedAtMs?: number | null;
}

interface UpsertItemWithAssetId extends UpsertItemBase {
  assetId: string;
}

const getUpsertItemKey = (item: UpsertItemBase) => {
  const { address, chainId, chainType, id } = item;

  return `${address}--${chainId}--${chainType}--${id}`;
};

const getUpsertItemKeyWithAssetId = (item: UpsertItemWithAssetId) => {
  const { address, chainId, chainType, assetId, id } = item;

  return `${address}--${chainId}--${chainType}--${id}--${assetId}`;
};

function shouldUpdateByTime(e: { lastUpdatedAtMs?: number | null }, i: { lastUpdatedAtMs?: number | null }) {
  if (!!e.lastUpdatedAtMs && !!i.lastUpdatedAtMs) {
    return e.lastUpdatedAtMs < i.lastUpdatedAtMs;
  }
  return true;
}

export function upsertList<T>(
  originalList: T[],
  incomingList: T[],
  getKey: (item: T) => string,
  shouldUpdate: (existing: T, incoming: T) => boolean,
  merge: (existing: Draft<T>, incoming: T) => void,
): T[] {
  return produce(originalList, (draft) => {
    const existingMap = new Map<string | number, Draft<T>>();
    draft.forEach((item) => {
      existingMap.set(getKey(item as T), item);
    });

    incomingList.forEach((incomingItem) => {
      const key = getKey(incomingItem);
      const existing = existingMap.get(key);

      if (existing) {
        if (shouldUpdate(existing as T, incomingItem)) {
          merge(existing as Draft<T>, incomingItem);
        }
      } else {
        const newItem = incomingItem as Draft<T>;
        draft.push(newItem);
      }
    });
  });
}

export function upsertStakingList<T extends { lastUpdatedAtMs?: number | null }>(
  originalList: T[],
  incomingList: T[],
  getKey: (item: T) => string,
  merge: (existing: Draft<T>, incoming: T) => void,
): T[] {
  return upsertList(originalList, incomingList, getKey, shouldUpdateByTime, merge);
}

export const upsertCosmosDelegation = <T extends AccountAddressDelegationsCosmos>(originalList: T[], incomingList: T[]) => {
  return upsertStakingList(originalList, incomingList, getUpsertItemKeyWithAssetId, (e, i) => {
    e.delegations = i.delegations;
    e.lastUpdatedAtMs = i.lastUpdatedAtMs;
  });
};

export const upsertCosmosUndelegation = <T extends AccountAddressUnbondingsCosmos>(originalList: T[], incomingList: T[]) => {
  return upsertStakingList(originalList, incomingList, getUpsertItemKeyWithAssetId, (e, i) => {
    e.unbondings = i.unbondings;
    e.lastUpdatedAtMs = i.lastUpdatedAtMs;
  });
};

export const upsertCosmosReward = <T extends AccountAddressRewardsCosmos>(originalList: T[], incomingList: T[]) => {
  return upsertStakingList(originalList, incomingList, getUpsertItemKeyWithAssetId, (e, i) => {
    e.rewards = i.rewards;
    e.lastUpdatedAtMs = i.lastUpdatedAtMs;
  });
};

export const upsertCosmosCommission = <T extends AccountAddressCommissionsCosmos>(originalList: T[], incomingList: T[]) => {
  return upsertStakingList(originalList, incomingList, getUpsertItemKeyWithAssetId, (e, i) => {
    e.commissions = i.commissions;
    e.lastUpdatedAtMs = i.lastUpdatedAtMs;
  });
};

export const upsertSuiDelegation = <T extends AccountAddressDelegationsSui>(originalList: T[], incomingList: T[]) => {
  return upsertStakingList(originalList, incomingList, getUpsertItemKey, (e, i) => {
    e.delegations = i.delegations;
    e.lastUpdatedAtMs = i.lastUpdatedAtMs;
  });
};

export const upsertIotaDelegation = <T extends AccountAddressDelegationsIota>(originalList: T[], incomingList: T[]) => {
  return upsertStakingList(originalList, incomingList, getUpsertItemKey, (e, i) => {
    e.delegations = i.delegations;
    e.lastUpdatedAtMs = i.lastUpdatedAtMs;
  });
};

export function upsertBalanceList<T extends UpsertItemBase>(originalList: T[], incomingList: T[], merge: (existing: Draft<T>, incoming: T) => void): T[] {
  return upsertList(originalList, incomingList, getUpsertItemKey, shouldUpdateByTime, merge);
}

export const upsertCosmosBalance = <T extends AccountAddressBalanceCosmos>(originalList: T[], incomingList: T[]) => {
  return upsertBalanceList(originalList, incomingList, (e, i) => {
    if (i.status !== 'error') {
      e.balances = i.balances;
    }

    e.lastUpdatedAtMs = i.lastUpdatedAtMs;
    e.status = i.status;
  });
};

export const upsertCustomCosmosBalance = <T extends AccountAddressBalanceCosmos>(originalList: T[], incomingList: T[]) => {
  return upsertBalanceList(originalList, incomingList, (e, i) => {
    if (i.status !== 'error') {
      e.balances = i.balances;
    }

    e.lastUpdatedAtMs = i.lastUpdatedAtMs;
    e.status = i.status;
  });
};

export const upsertEVMBalance = <T extends AccountAddressBalanceEvm>(originalList: T[], incomingList: T[]) => {
  return upsertBalanceList(originalList, incomingList, (e, i) => {
    if (i.status !== 'error') {
      e.balance = i.balance;
    }

    e.lastUpdatedAtMs = i.lastUpdatedAtMs;
    e.status = i.status;
  });
};

export const upsertBitcoinBalance = <T extends AccountAddressBalanceBitcoin>(originalList: T[], incomingList: T[]) => {
  return upsertBalanceList(originalList, incomingList, (e, i) => {
    if (i.status !== 'error') {
      e.balance = i.balance;
    }

    e.lastUpdatedAtMs = i.lastUpdatedAtMs;
    e.status = i.status;
  });
};

export const upsertAptosBalance = <T extends AccountAddressBalanceAptosV2>(originalList: T[], incomingList: T[]) => {
  return upsertBalanceList(originalList, incomingList, (e, i) => {
    if (i.status !== 'error') {
      e.balances = i.balances;
    }
    e.lastUpdatedAtMs = i.lastUpdatedAtMs;
    e.status = i.status;
  });
};

export const upsertSuiBalance = <T extends AccountAddressBalanceSui>(originalList: T[], incomingList: T[]) => {
  return upsertBalanceList(originalList, incomingList, (e, i) => {
    if (i.status !== 'error') {
      e.balances = i.balances;
    }

    e.lastUpdatedAtMs = i.lastUpdatedAtMs;
    e.status = i.status;
  });
};

export const upsertIotaBalance = <T extends AccountAddressBalanceIota>(originalList: T[], incomingList: T[]) => {
  return upsertBalanceList(originalList, incomingList, (e, i) => {
    if (i.status !== 'error') {
      e.balances = i.balances;
    }

    e.lastUpdatedAtMs = i.lastUpdatedAtMs;
    e.status = i.status;
  });
};

export const upsertERC20Balance = <T extends AccountAddressBalanceErc20>(originalList: T[], incomingList: T[]) => {
  return upsertBalanceList(originalList, incomingList, (e, i) => {
    const resolved = i.balances.map((incoming) => {
      if (incoming.status !== 'error') return incoming;

      const existingBalance = e.balances.find((balance) => isEqualsIgnoringCase(balance.contract, incoming.contract));

      return existingBalance ? { ...incoming, balance: existingBalance.balance } : incoming;
    });

    e.balances = resolved;
  });
};

export const upsertCW20Balance = <T extends AccountAddressBalanceCw20>(originalList: T[], incomingList: T[]) => {
  return upsertBalanceList(originalList, incomingList, (e, i) => {
    const resolved = i.balances.map((incoming) => {
      if (incoming.status !== 'error') return incoming;

      const existingBalance = e.balances.find((balance) => isEqualsIgnoringCase(balance.contract, incoming.contract));

      return existingBalance ? { ...incoming, balance: existingBalance.balance } : incoming;
    });

    e.balances = resolved;
  });
};

export const upsertGnoBalance = <T extends AccountAddressBalanceGno>(originalList: T[], incomingList: T[]) => {
  return upsertBalanceList(originalList, incomingList, (e, i) => {
    if (i.status !== 'error') {
      e.balance = i.balance;
      e.lastUpdatedAtMs = i.lastUpdatedAtMs;
    }

    if (e.status !== i.status) {
      e.status = i.status;
    }
  });
};

export const upsertGrc20Balance = <T extends AccountAddressBalanceGrc20>(originalList: T[], incomingList: T[]) => {
  return upsertBalanceList(originalList, incomingList, (e, i) => {
    const resolved = i.balances.map((incoming) => {
      if (incoming.status !== 'error') return incoming;

      return e.balances.find((exist) => isEqualsIgnoringCase(exist.contract, incoming.contract)) || incoming;
    });

    e.balances = resolved;
  });
};
