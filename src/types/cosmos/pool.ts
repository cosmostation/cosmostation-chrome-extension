export type Pool = {
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

export type PoolsAsset = {
  id: string;
  adenom: string;
  bdenom: string;
};

export type PoolsAssetResponse = PoolsAsset[];
