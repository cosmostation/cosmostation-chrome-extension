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

export type NFTExtensionRepsonse = Record<string, unknown>;

export interface NFTInfoResponse {
  data: {
    token_uri: string;
    extension?: NFTExtensionRepsonse;
  };
}
export interface NFTIDResponse {
  data: {
    tokens?: string[];
    ids?: string[];
  };
}

export interface OwnedNFTsTokenIdResponse {
  contractAddress: string;
  tokens: string[];
}

export interface NumTokensInfoResponse {
  data: {
    count: string;
  };
}

export type CollectionInfoResponse = {
  data: {
    creator: string;
    description: string;
    external_url?: string;
    image: string;
    royalty_info: {
      payment_address: string;
      shares: string;
    };
  };
};

export type ContractInfoResponse = {
  data: {
    name: string;
    symbol: string;
  };
};

export type NTRNRewardsResponse = {
  data: {
    pending_rewards: {
      denom: string;
      amount: string;
    };
  };
};
