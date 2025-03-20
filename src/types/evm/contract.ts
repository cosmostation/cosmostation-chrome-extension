export type ERC721BalanceOfPayload = string;

export type ERC721URIPayload = string;

export type ERC721SupportInterfacePayload = boolean;

export type ERC721OwnerPayload = string;

export type ERC1155URIPayload = string;

export type ERC1155SupportInterfacePayload = boolean;

export type ERC1155BalanceOfPayload = string;

export interface GetNFTMetaResponse {
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
}
