export type WeightedPool = {
  '@type': '/osmosis.gamm.v1beta1.Pool';
  id: string;
  pool_params: {
    swap_fee: string;
    exit_fee: string;
  };
  pool_assets: {
    token: {
      denom: string;
      amount: string;
    };
    weight: string;
  }[];
  total_weight: string;
};

export type PoolResponse = {
  pool: WeightedPool | StablePool;
};

export type StablePool = {
  '@type': '/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool';
  id: string;
  pool_params: {
    swap_fee: string;
    exit_fee: string;
  };
  pool_liquidity: {
    denom: string;
    amount: string;
  }[];
  scaling_factors: string[];
};

export type PoolsAsset = {
  id: string;
  adenom: string;
  bdenom: string;
};

export type PoolsAssetResponse = PoolsAsset[];
