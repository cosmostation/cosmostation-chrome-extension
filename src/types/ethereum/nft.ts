import type { TOKEN_TYPE } from '~/constants/ethereum';

export type EthereumERC721Token = {
  id: string;
  tokenId: string;
  ethereumNetworkId: string;
  tokenType: typeof TOKEN_TYPE.ERC721;
  ownerAddress: string;
  address: string;
};

export type EthereumERC1155Token = {
  id: string;
  tokenId: string;
  ethereumNetworkId: string;
  tokenType: typeof TOKEN_TYPE.ERC1155;
  ownerAddress: string;
  address: string;
};

export type EthereumNFT = EthereumERC721Token | EthereumERC1155Token;

export type GetNFTMetaPayload = {
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
    trait_count: number;
    trait_type: string;
    value: string | number;
  }[];
};

export type GetNFTOwnerPayload = boolean;

export type GetNFTStandardPayload = typeof TOKEN_TYPE.ERC1155 | typeof TOKEN_TYPE.ERC721;

export type GetNFTURIPayload = string;

export type GetNFTBalancePayload = string;
