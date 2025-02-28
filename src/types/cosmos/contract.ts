export interface CW20BalanceResponse {
  data: {
    balance?: string;
  };
}

export interface CW20TokenInfoResponse {
  data: {
    name: string;
    symbol: string;
    decimals: number;
    total_supply: string;
  };
}
