import type { Amount } from '~/types/cosmos/common';

export type VestingType =
  | 'BaseVestingAccount'
  | 'ContinuousVestingAccount'
  | 'DelayedVestingAccount'
  | 'Period'
  | 'PeriodicVestingAccount'
  | 'PermanentLockedAccount';

export type AuthAccountPubKey = {
  type: string;
  value: string;
};

export type VestingPeriod = {
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
  code_hash?: string;
};

export type BaseAccount = {
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

export type AuthBaseAccount = {
  account_number: string;
  address: string;
  sequence?: string;
};

export type AuthAccountResult = {
  base_account?: AuthBaseAccount;
  type?: VestingType;
  value: AuthAccountValue | AuthBaseVestingAccount | AuthBaseWithStartAndPeriod;
  account_number?: string;
  sequence?: string;
  address?: string;
  public_key?: AuthAccountPubKey;
  code_hash?: string;
};

export type AuthAccountsPayload = {
  height: string;
  result: AuthAccountResult;
};

export type AuthAccount = {
  type: VestingType;
  value: AuthAccountValue;
};

type DesmosAuthAccountPubKey = {
  '@type': string;
  key: string;
};

export type DesmosBaseAccount = {
  '@type': string;
  address: string;
  pub_key: DesmosAuthAccountPubKey;
  account_number: string;
  sequence: string;
};

export type DesmosAccount = {
  '@type': string;
  base_vesting_account: {
    base_account: DesmosBaseAccount;
    original_vesting: Amount[];
    delegated_free: Amount[];
    delegated_vesting: Amount[];
    end_time: string;
  };
  start_time: string;
  vesting_periods: VestingPeriod[];
};

export type DesmosAuthAccount = {
  '@type': string;
  account: DesmosAccount | DesmosBaseAccount;
  dtag: string;
  nickname: string;
  bio: string;
  pictures: {
    profile: string;
    cover: string;
  };
  creation_date: string;
};

export type DesmosModuleAccount = {
  '@type': string;
  base_account: DesmosBaseAccount;
  name: string;
};

export type DesmosAuthAccountsPayload = {
  account: DesmosAuthAccount | DesmosAccount | DesmosModuleAccount;
};
