import type { VALIDATOR_STATUS } from '@/constants/cosmos/validator';

import type { Pagination, Uptime } from './common';

export type UnbondingValidators = {
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

export interface GetValidatorsResponse {
  validators: CosmosValidator[];
  pagination: Pagination;
}

export interface CosmosValidator {
  operator_address: string;
  consensus_pubkey: ConsensusPubkey;
  jailed: boolean;
  status: string;
  tokens: string;
  delegator_shares: string;
  description: Description;
  unbonding_height: string;
  unbonding_time: Date;
  commission: Commission;
  min_self_delegation: string;
  unbonding_on_hold_ref_count: string;
  unbonding_ids: string[];
  validator_bond_shares: string;
  liquid_shares: string;
}

export interface FormattedCosmosValidator extends CosmosValidator {
  monikerImage?: string;
  validatorStatus?: ValidatorStatus;
}

export interface Commission {
  commission_rates: CommissionRates;
  update_time: Date;
}

export interface CommissionRates {
  rate: string;
  max_rate: string;
  max_change_rate: string;
}

export interface ConsensusPubkey {
  '@type': string;
  key: string;
}

export interface Description {
  moniker: string;
  identity: string;
  website: string;
  security_contact: string;
  details: string;
}

export type ValidatorStatus = ValueOf<typeof VALIDATOR_STATUS>;
