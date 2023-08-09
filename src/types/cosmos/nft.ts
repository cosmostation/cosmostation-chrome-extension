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

export type CosmwasmSmartContract = {
  chainId: string;
  smartContracts: {
    address: string;
    name?: string;
    symbol?: string;
  }[];
};
