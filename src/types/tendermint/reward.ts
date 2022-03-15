import type { Amount } from '~/types/tendermint/common';

export type Reward = {
  reward: Amount[];
  validator_address: string;
};

export type RewardPayload = {
  result: {
    rewards: Reward[];
    total: Amount[];
  };
};
