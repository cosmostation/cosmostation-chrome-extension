import type { TOKEN_TYPE } from '~/constants/cosmos';

import type { NFTExtensionPayload } from './contract';

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
};

export type NFTMetaResponse = {
  imageURL: string;
  metaData?: NFTMetaPayload;
  contractAddress: string;
  tokenId: string;
  extensionData?: NFTExtensionPayload;
};
