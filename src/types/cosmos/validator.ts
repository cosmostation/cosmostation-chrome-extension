import type { Pagination, Uptime } from '~/types/cosmos/common';

export type Validators = {
  account_address: string;
  consensus_pubkey: string;
  delegator_shares: string;
  details: string;
  identity: string;
  jailed: boolean;
  keybase_url: string;
  max_change_rate: string;
  max_rate: string;
  min_self_delegation: string;
  moniker: string;
  operator_address: string;
  rank: number;
  rate: string;
  status: number;
  tokens: string;
  unbonding_height: string;
  unbonding_time: string;
  update_time: string;
  uptime: Uptime;
  website: string;
};

export type Validator = {
  operator_address: string;
  consensus_pubkey: string;
  jailed: boolean;
  status: number | string;
  tokens: string;
  delegator_shares: string;
  description: {
    moniker: string;
    identity: string;
    website: string;
    security_contact: string;
    details: string;
  };
  unbonding_height: string;
  unbonding_time: string;
  commission: {
    commission_rates: {
      rate: string;
      max_rate: string;
      max_change_rate: string;
    };
    update_time: string;
  };
  min_self_delegation: string;
};

export type ValidatorPayload = {
  result?: Validator[];
  validators?: Validator[];
  pagination?: Pagination;
};
