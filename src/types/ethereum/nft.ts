export type GetNFTMetaPayload = {
  name?: string;
  description?: string;
  image?: string;
  edition?: string | number;
  attributes?: {
    trait_type: string;
    value: string | number;
  }[];
};
