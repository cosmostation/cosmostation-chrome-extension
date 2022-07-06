/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import dayjs from 'dayjs';

import { gt, minus, plus } from '~/Popup/utils/big';
import type { AuthAccount, VestingType } from '~/types/cosmos/account';
import type { Amount } from '~/types/cosmos/common';

export type Vesting = {
  originAmount?: Amount;
  amount: Amount;
  startAt?: string;
  releaseAt: string;
  type: VestingType;
};

const getOriginalVestingTotal = (vestingAccount: AuthAccount, denom: string): string => {
  const originVesting = vestingAccount.value.original_vesting || [];
  const filteredVesting = originVesting.filter((item) => item.denom === denom);

  return filteredVesting.reduce((acc, cur) => plus(acc, cur.amount, 0), '0');
};

const getPeriodicVestingRemained = (vestingAccount: AuthAccount, denom: string): string => {
  const { start_time, vesting_periods } = vestingAccount.value;

  if (typeof start_time === 'string' && Array.isArray(vesting_periods)) {
    const now = dayjs().unix();
    let vestingBaseTime = Number(start_time);

    const remained = vesting_periods.filter(({ length }) => {
      const _length = length === undefined ? 0 : Number(length);
      vestingBaseTime += _length;

      return vestingBaseTime > now;
    });

    return remained.reduce((acc, cur) => {
      const _filtered = cur.amount.filter((item) => item.denom === denom);
      const sum = _filtered.reduce((_acc, _cur) => plus(_acc, _cur.amount, 0), '0');
      return plus(acc, sum, 0);
    }, '0');
  }
  return '0';
};

const getDelayedVestingRemained = (vestingAccount: AuthAccount, denom: string): string => {
  const endTime = vestingAccount.value.end_time;

  if (endTime) {
    const now = dayjs().unix();
    if (now > Number(endTime)) {
      return '0';
    }
    return getOriginalVestingTotal(vestingAccount, denom);
  }
  return '0';
};

const getContinuousVestingRemained = (vestingAccount: AuthAccount, denom: string): string => {
  const now = dayjs().unix();
  const { value } = vestingAccount;

  const startTime = Number(value.start_time);
  const endTime = Number(value.end_time);

  if (now >= endTime) {
    return '0';
  }

  const originalVestingTotal = getOriginalVestingTotal(vestingAccount, denom);
  if (now < startTime) {
    return originalVestingTotal;
  }

  const ratio = (now - startTime) / (endTime - startTime);
  const vested = Math.floor(Number(originalVestingTotal) * ratio);

  return minus(originalVestingTotal, vested, 0);
};

const buildPeriodicVestingArray = (account: AuthAccount): Vesting[] => {
  const now = dayjs();
  let lastTime = dayjs(Number(account.value.start_time) * 1000);

  const vestingPeriods = account.value.vesting_periods || [];

  return vestingPeriods.reduce<Vesting[]>((acc, cur) => {
    if (!cur.amount.length) {
      return acc;
    }

    if (cur.length === undefined) {
      return [
        ...acc,
        ...(cur.amount.map((amount) => ({
          type: 'PeriodicVestingAccount',
          amount,
          releaseAt: lastTime.toString(),
        })) as Vesting[]),
      ];
    }

    lastTime = lastTime.add(dayjs(Number(cur.length) * 1000).valueOf());
    if (!now.isAfter(lastTime)) {
      return [
        ...acc,
        ...(cur.amount.map((amount) => ({
          type: 'PeriodicVestingAccount',
          amount,
          releaseAt: lastTime.toString(),
        })) as Vesting[]),
      ];
    }

    return acc;
  }, []);
};

const buildDelayedVestingArray = (account: AuthAccount): Vesting[] => {
  const endTime = account.value.end_time;
  const originalVesting = account.value.original_vesting || [];

  if (originalVesting?.length && endTime) {
    return originalVesting.map((amount) => ({
      type: 'DelayedVestingAccount',
      amount,
      releaseAt: dayjs(Number(endTime) * 1000).toString(),
    }));
  }

  return [];
};

const buildContinuousVestingArray = (account: AuthAccount): Vesting[] => {
  const startTime = Number(account.value.start_time);
  const endTime = Number(account.value.end_time);

  const originalVesting = account.value.original_vesting || [];

  const now = dayjs().unix();

  if (originalVesting?.length) {
    return originalVesting.map((vesting) => {
      const originalVestingTotal = getOriginalVestingTotal(account, vesting.denom);
      const denomOriginalVesting = originalVesting.find((item) => item.denom === vesting.denom);
      const ratio = (now - startTime) / (endTime - startTime);
      const vested = now > startTime ? Math.floor(Number(originalVestingTotal) * ratio) : 0;

      return {
        type: 'ContinuousVestingAccount',
        amount: {
          denom: vesting.denom,
          amount: vested.toString(),
        },
        originAmount: denomOriginalVesting,
        startAt: dayjs(startTime * 1000).toString(),
        releaseAt: dayjs(endTime * 1000).toString(),
      };
    });
  }
  return [];
};

export const isPeriodicVestingAccount = (account?: AuthAccount): boolean => account?.type === 'PeriodicVestingAccount';

export const isContinuousVestingAccount = (account?: AuthAccount): boolean => account?.type === 'ContinuousVestingAccount';

export const isDelayedVestingAccount = (account?: AuthAccount): boolean => account?.type === 'DelayedVestingAccount';

export const isVestingAccount = (account: AuthAccount): boolean =>
  isPeriodicVestingAccount(account) || isContinuousVestingAccount(account) || isDelayedVestingAccount(account);

export const getDelegatedVestingTotal = (vestingAccount?: AuthAccount, denom?: string): string => {
  const delegatedVesting = vestingAccount?.value?.delegated_vesting || [];
  const denomDelegatedVesting = delegatedVesting.filter((item) => item.denom === denom);

  return denomDelegatedVesting.reduce((acc, cur) => plus(acc, cur.amount, 0), '0');
};

export const getVestingRemained = (account: AuthAccount | undefined, denom: string): string => {
  try {
    if (account) {
      if (isPeriodicVestingAccount(account)) {
        return getPeriodicVestingRemained(account, denom);
      }

      if (isDelayedVestingAccount(account)) {
        return getDelayedVestingRemained(account, denom);
      }

      if (isContinuousVestingAccount(account)) {
        return getContinuousVestingRemained(account, denom);
      }
    }

    return '0';
  } catch (error) {
    return '0';
  }
};

export const getVestings = (account: AuthAccount): Vesting[] | undefined => {
  if (isPeriodicVestingAccount(account)) {
    return buildPeriodicVestingArray(account);
  }

  if (isDelayedVestingAccount(account)) {
    return buildDelayedVestingArray(account);
  }

  if (isContinuousVestingAccount(account)) {
    return buildContinuousVestingArray(account);
  }

  return undefined;
};

/**
 * Vesting 어카운트일 경우 bankBalance에 위임가능한 vesting 값이 더해져 있음.
 * 위임 가능한 vesting 양은
 * delegatableVesting = remainedVesting - delegatedVesting
 * 민트스캔에서의 available은 전송 가능한 토큰량이기 때문에
 * available = bankBalance - delegatableVesting
 * 자세한 내용은 https://docs.cosmos.network/v0.42/modules/auth/05_vesting.html 참고
 *
 * @returns [available count, vesting count without delegate]
 */
export const getVestingRelatedBalances = (bankBalance: string, vestingRemained: string, delegatedVestingTotal: string, unbondingBalance: string): string[] => {
  let available = bankBalance;

  const notLockVestingValue = minus(vestingRemained, unbondingBalance, 0);
  const delegatableVesting = Math.max(0, Number(minus(notLockVestingValue, delegatedVestingTotal, 0)));

  if (gt(delegatableVesting, '0')) {
    available = Math.max(0, Number(minus(bankBalance, delegatableVesting, 0))).toString();
  }

  return [available.toString(), delegatableVesting.toString()];
};

/**
 * 퍼시스턴스는 다른 체인들과 다르게 위임시 transferable이 vesting보다 먼저 위임됨.
 * 또 퍼시스턴스는 Auth/Account 모듈에서 delegatedVesting 값을 주지 않음.
 * 먼저 민트스캔에서 available은 전송이 가능한 토큰량이기 때문에
 * available = bankBalance - vestingRemained
 * bankBalance는 위임이 가능한 토큰량이기 때문에 vesting된 토큰중 위임이 가능한 양은
 * delegatableVesting = bankBalance - available
 *
 * @returns [available count, vesting count without delegate]
 */
export const getPersistenceVestingRelatedBalances = (bankBalance: string, vestingRemained: string): string[] => {
  const available = Math.max(0, Number(minus(bankBalance, vestingRemained, 0)));
  const delegatableVesting = Math.max(0, Number(minus(bankBalance, available, 0)));

  return [available.toString(), delegatableVesting.toString()];
};
