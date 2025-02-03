import type { Amount } from './common';

export type IncentiveBaseClaim = {
  owner: string;
  reward: Amount[] | Amount;
};

type IncentiveRewardIndex = {
  collateral_type: string;
  reward_factor: string;
};

type IncentiveSupplyRewardIndex = {
  collateral_type: string;
  reward_indexes: IncentiveRewardIndex[];
};

export type IncentiveHardLiquidityProviderClaims = {
  base_claim: IncentiveBaseClaim;
  supply_reward_indexes: IncentiveSupplyRewardIndex[] | null;
  borrow_reward_indexes: IncentiveSupplyRewardIndex[] | null;
};

export type IncentiveClaims = {
  base_claim: IncentiveBaseClaim;
  reward_indexes: (IncentiveRewardIndex | IncentiveSupplyRewardIndex)[];
};

export type Incentive = {
  hard_liquidity_provider_claims: IncentiveHardLiquidityProviderClaims[] | null;
  usdx_minting_claims: IncentiveClaims[] | null;
  delegator_claims: IncentiveClaims[] | null;
  swap_claims: IncentiveClaims[] | null;
};

export type IncentivePayload = Incentive;
