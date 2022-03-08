import type { Amount, Pagination } from '~/types/cosmos/common';

export type DelegationResponse = {
  balance: Amount;
  delegation: ValidatorDelegator;
};

export type DelegationResult = {
  balance: Amount | string;
  delegator_address: string;
  validator_address: string;
  shares: string;
};

export type KavaValidatorDelegator = {
  delegator_address: string;
  validator_address: string;
  shares: string;
};

export type KavaDelegationResult = {
  balance: Amount;
  delegation?: KavaValidatorDelegator;
};

export type KavaDelegationPayload = {
  height: string;
  result: KavaDelegationResult[];
};

export type Delegation = {
  delegatorAddress: string;
  validatorAddress: string;
  amount: Amount;
  reward?: Amount;
  moniker?: string;
};

export type LcdDelegationResponse = {
  balance: Amount;
  delegation: LcdValidatorDelegator;
};

export type DelegationPayload = {
  delegation_responses?: LcdDelegationResponse[];
  result?: DelegationResult[];
  pagination: Pagination;
};

export type ValidatorDelegator = {
  delegator_address: string;
  amount: string;
};

export type ValidatorDelegators = {
  height?: string;
  created_at?: string;
  total_count: number;
  delegators: ValidatorDelegator[];
};

export type LcdValidatorDelegator = {
  amount: string;
  delegator_address: string;
  shares: string;
  validator_address: string;
};

export type LcdValidatorDelegators = {
  delegator_num_change_24h: number;
  total_delegator_num: number;
  delegations: LcdValidatorDelegator[];
};
