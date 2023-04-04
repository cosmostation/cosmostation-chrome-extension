export type SupportChain = {
  chain: string;
  chain_id: string;
  lcd: string;
  prefix: string;
  is_testnet: boolean;
};

export type SupportChainPayload = {
  chains: SupportChain[];
};
