import type { Pagination } from '~/types/cosmos/common';
import type { Validators } from '~/types/cosmos/validator';

export type ParsingUnbondingProps = {
  balance: string;
  validator_address: string;
  moniker: string | Validators;
  completion_time: string;
  creation_height: string;
};

type Entries = {
  balance: string;
  completion_time: string;
  creation_height: string;
  initial_balance: string;
};

export type UnbondingResponses = {
  delegator_address: string;
  validator_address: string;
  entries: Entries[];
};

export type UnbondingPayload = {
  unbonding_responses: UnbondingResponses[];
  result?: UnbondingResponses[];
  pagination: Pagination;
};

export type Unbonding = {
  delegator_address: string;
  validator_address: string;
  entries: Entries;
};
