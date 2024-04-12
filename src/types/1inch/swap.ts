export type OneInchSwapPayload = {
  toAmount: string;
  tx: Tx;
};

export type Token = {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  logoURI: string;
  tags: string[];
  eip2612?: boolean;
  displayedSymbol?: string;
  isFoT?: boolean;
  domainVersion?: string;
  wrappedNative?: string;
  synth?: boolean;
};

export type Assets = {
  tokens: Record<string, Token>;
};

export type SpotPrice = Record<string, string>;

export type SpotPricesResponse = Record<string, number>;

export type Protocol = {
  name: string;
  part: number;
  fromTokenAddress: string;
  toTokenAddress: string;
};

export type Tx = {
  from: string;
  to: string;
  data: string;
  value: string;
  gas: number;
  gasPrice: string;
};

export type SupportTokensPayload = Record<string, Record<string, Token>>;
