import type { TOKEN_TYPE } from '~/constants/cosmos';

export type CosmosNFT = {
  id: string;
  tokenId: string;
  baseChainUUID: string;
  tokenType: typeof TOKEN_TYPE.CW721;
  ownerAddress: string;
  address: string;
};

export type NFTMetaPayload = Record<string, unknown>;

export type NFTMetaResponse = {
  imageURL: string;
  metaData?: NFTMetaPayload;
  contractAddress: string;
  tokenId: string;
};
