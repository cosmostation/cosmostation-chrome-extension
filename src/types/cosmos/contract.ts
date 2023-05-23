export type SmartPayload = {
  height: number;
  result: {
    smart: string;
  };
};

export type NFTInfoPayload = {
  token_uri: string;
};

export type NFTIdPayload = {
  tokens: string[];
};

export type TokenInfo = {
  name: string;
  symbol: string;
  decimals: number;
  total_supply: string;
};

export type Balance = {
  balance: string;
};
