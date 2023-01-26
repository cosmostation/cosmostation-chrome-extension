export type Pool = {
  '@type': string;
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
  pool: Pool;
};

export type StablePool = {
  '@type': string;
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

export type StablePoolResponse = {
  pool: StablePool;
};

export type PoolsAsset = {
  id: string;
  adenom: string;
  bdenom: string;
};

export type PoolsAssetResponse = PoolsAsset[];
