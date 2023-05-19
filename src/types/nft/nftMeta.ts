export type SuiNFTMetaType = {
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
  isRare?: boolean;
};
