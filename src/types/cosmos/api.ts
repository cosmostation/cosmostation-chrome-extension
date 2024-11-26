export interface CosmosBalanceResponse {
  balances: CosmosBalance[];
  pagination: {
    next_key: string | null;
    total: string;
  };
}

export interface CosmosCw20BalanceResponse {
  data: {
    balance?: string;
  };
}

export interface CosmosBalance {
  denom: string;
  amount: string;
}
