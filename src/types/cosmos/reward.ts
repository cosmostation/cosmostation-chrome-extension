import type { Amount } from '~/types/cosmos/common';

export type Reward = {
  reward: Amount[];
  validator_address: string;
};

export type RewardPayload = {
  rewards?: Reward[];
  total?: Amount[];
  result?: {
    rewards: Reward[];
    total: Amount[];
  };
};
