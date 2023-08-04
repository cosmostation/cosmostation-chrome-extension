export type SmartPayload = {
  height: number;
  result: {
    smart: string;
  };
};

export type NFTCollectionInfoPayload = {
  contractAddress: string;
  data: SmartPayload;
};

export type NFTContractInfoPayload = {
  contractAddress: string;
  data: SmartPayload;
};

export type NFTsURIPayload = {
  contractAddress: string;
  tokenId: string;
  data: SmartPayload;
};

export type OwnedNFTTokenIdsPayload = {
  contractAddress: string;
  data: SmartPayload;
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
