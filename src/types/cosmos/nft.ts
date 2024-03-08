import type { TOKEN_TYPE } from '~/constants/cosmos';

import type { CollectionInfoPayload, ContractInfoPayload, NumTokensInfoPayload } from './contract';

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
  contractAddress: string;
  tokenId: string;
  name: string;
  description: string;
  sourceURL?: string;
  attributes?: { key: string; value: unknown }[];
  contractInfo?: ContractInfoPayload['data'];
  collectionInfo?: CollectionInfoPayload['data'];
  mintedNFTsCount?: NumTokensInfoPayload['data'];
};
