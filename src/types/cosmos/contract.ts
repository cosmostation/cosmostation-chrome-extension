export type SmartPayload = {
  height: number;
  result: {
    smart: string;
  };
};

export type CW20BalanceResponse = {
  data: {
    balance?: string;
  };
};

export type CW20TokenInfoResponse = {
  data: {
    name: string;
    symbol: string;
    decimals: number;
    total_supply: string;
  };
};

export type Balance = {
  balance: string;
};
