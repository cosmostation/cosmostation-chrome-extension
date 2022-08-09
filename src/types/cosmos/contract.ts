export type SmartPayload = {
  height: number;
  result: {
    smart: string;
  };
};

export type TokenInfo = {
  name: string;
  symbol: string;
  decimals: number;
  total_supply: string;
};
