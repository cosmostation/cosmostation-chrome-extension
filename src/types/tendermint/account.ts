import type { Amount } from '~/types/tendermint/common';

export type VestingType =
  | 'BaseVestingAccount'
  | 'ContinuousVestingAccount'
  | 'DelayedVestingAccount'
  | 'Period'
  | 'PeriodicVestingAccount'
  | 'PermanentLockedAccount';

type AuthAccountPubKey = {
  type: string;
  value: string;
};

type VestingPeriod = {
  length: string;
  amount: Amount[];
};

export type AuthAccountValue = {
  address: string;
  coins?: Amount[];
  public_key: AuthAccountPubKey;
  account_number: string;
  sequence: string;
  original_vesting?: Amount[];
  delegated_free?: Amount[];
  delegated_vesting?: Amount[];
  end_time?: string;
  start_time?: string;
  vesting_periods?: VestingPeriod[];
};

type BaseAccount = {
  address: string;
  public_key: AuthAccountPubKey;
  account_number: string;
  sequence: string;
};

export type AuthBaseVestingAccount = {
  base_vesting_account: {
    base_account: BaseAccount;
    original_vesting: Amount[];
    delegated_free: Amount[];
    delegated_vesting: Amount[];
    end_time: string;
  };
  start_time?: string;
};

export type AuthBaseWithStartAndPeriod = {
  base_vesting_account: {
    base_account: BaseAccount;
    original_vesting: Amount[];
    delegated_free: Amount[];
    delegated_vesting: Amount[];
    end_time: string;
  };
  start_time: string;
  vesting_periods: VestingPeriod[];
};

export type AuthAccountResult = {
  type?: VestingType;
  value: AuthAccountValue | AuthBaseVestingAccount | AuthBaseWithStartAndPeriod;
  account_number?: string;
  sequence?: string;
  address?: string;
  public_key?: AuthAccountPubKey;
};

export type AuthAccountsPayload = {
  height: string;
  result: AuthAccountResult;
};

export type AuthAccount = {
  type: VestingType;
  value: AuthAccountValue;
};
