export type GetNFTMetaPayload = {
  metaURI?: string;
  name?: string;
  description?: string;
  image?: string;
  edition?: string | number;
  external_url?: string;
  animation_url?: string;
  attributes?: {
    trait_type: string;
    value: string | number;
  }[];
};
