import type { TOKEN_TYPE } from '~/constants/cosmos';

export type CosmosNFT = {
  id: string;
  tokenId: string;
  baseChainUUID: string;
  tokenType: typeof TOKEN_TYPE.CW721;
  ownerAddress: string;
  address: string;
};

export type NFTMetaPayload = {
  dna?: string;
  name?: string;
  description?: string;
  image?: string;
  imageHash?: string;
  edition?: string | number;
  date?: string | number;
  attributes?: {
    trait_type: string;
    value: string | number;
  }[];
  compiler?: string;
  contractAddress: string;
  tokenId: string;
};

export type CosmosNFTMeta = {
  contractAddress: string;
  tokenId: string;
  imageURL: string;
  rarity: string;
  dna?: string;
  name?: string;
  description?: string;
  imageHash?: string;
  edition?: string | number;
  date?: string | number;
  attributes?: {
    trait_type: string;
    value: string | number;
  }[];
  compiler?: string;
};

export type CollectionInfo = {
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

export type ContractInfo = {
  name: string;
  symbol: string;
  contractAddress?: string;
};

export type NumTokensInfo = {
  count: string;
};

export type NFTURIInfo = {
  token_uri: string;
  tokenId: string;
  contractAddress: string;
};

export type OwnedTokenIds = {
  tokens: string[];
  contractAddress: string;
};
