import type { TOKEN_TYPE } from '~/constants/cosmos';

export type CosmosNFT = {
  id: string;
  tokenId: string;
  chainUniqueId: string;
  tokenType: typeof TOKEN_TYPE.CW721;
  ownerAddress: string;
  address: string;
};

export type GetNFTMetaPayload = {
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
