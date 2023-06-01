import type { TOKEN_TYPE } from '~/constants/ethereum';

export type GetNFTMetaPayload = {
  metaURI?: string;
  name?: string;
  description?: string;
  image?: string;
  edition?: string | number;
  external_link?: string;
  animation_url?: string;
  attributes?: {
    trait_type: string;
    value: string | number;
  }[];
  traits?: {
    display_type?: string;
    max_value?: number;
    order?: null;
    trait_count: number;
    trait_type: string;
    value: string | number;
  }[];
};

export type GetNFTOwnerPayload = boolean;

export type GetNFTStandardPayload = typeof TOKEN_TYPE.ERC1155 | typeof TOKEN_TYPE.ERC721 | undefined;

export type GetNFTURIPayload = string;
