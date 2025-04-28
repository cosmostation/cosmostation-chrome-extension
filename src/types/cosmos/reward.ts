import type { Amount } from './common';

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

export type RewardDetails = {
  rewards?: Reward[];
  total?: Amount[];
};
