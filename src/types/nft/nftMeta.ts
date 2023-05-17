export type SuiNFTMetaType = {
  name?: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  projectUrl?: string;
  creator?: string;
  objectId?: string;
  ownerAddress?: string;
  objectFieldData?: Record<string, unknown>;
  isRare?: boolean;
};
