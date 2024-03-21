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

export type NFTExtensionPayload = Record<string, unknown>;

export type NFTsURIPayload = {
  contractAddress: string;
  tokenId: string;
  tokenURI: string;
  extension?: NFTExtensionPayload;
};

export type OwnedNFTTokenIDsPayload = {
  contractAddress: string;
  tokens: string[];
};

export type NFTInfoPayload = {
  data: {
    token_uri: string;
    extension?: NFTExtensionPayload;
  };
};

export type NFTIDPayload = {
  data: {
    tokens?: string[];
    ids?: string[];
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

export type CW20TokensBalanceResponse = {
  contractAddress: string;
  balance: string;
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
