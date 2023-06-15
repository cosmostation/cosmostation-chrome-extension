export type SuiNFTMeta = {
  name?: string;
  description?: string;
  imageURL?: string;
  link?: string;
  projectUrl?: string;
  creator?: string;
  objectId?: string;
  ownerAddress?: string;
  objectFieldData?: Record<string, unknown>;
  type?: string;
  rarity?: '';
};

export type EthereumNFTMeta = {
  name?: string;
  description?: string;
  imageURL?: string;
  animationURL?: string;
  rarity?: string;
  externalLink?: string;
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
