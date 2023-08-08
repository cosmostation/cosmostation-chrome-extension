export type SmartPayload = {
  height: number;
  result: {
    smart: string;
  };
};

export type CollectionInfoPayload = {
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

export type CollectionsInfoPayload = {
  contractAddress: string;
  creator: string;
  description: string;
  external_url?: string;
  image: string;
  royalty_info: {
    payment_address: string;
    shares: string;
  };
};

export type ContractInfoPayload = {
  data: {
    name: string;
    symbol: string;
  };
};

export type ContractsInfoPayload = {
  contractAddress: string;
  name: string;
  symbol: string;
};

export type NFTsURIPayload = {
  contractAddress: string;
  tokenId: string;
  tokenURI: string;
};

export type OwnedNFTTokenIDsPayload = {
  contractAddress: string;
  tokens: string[];
};

export type NFTInfoPayload = {
  data: {
    token_uri: string;
  };
};

export type NFTIDPayload = {
  data: {
    tokens: string[];
  };
};

export type NumTokensInfoPayload = {
  data: {
    count: string;
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
