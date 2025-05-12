import type { TOKEN_TYPE } from '@/constants/evm/token';

import type { ChainId, ChainType } from './chain';

export type NFTMetaPayload = Record<string, unknown>;

export interface SuiNFTMeta {
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
}

export interface IotaNFTMeta {
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
}

export interface EvmNFTMeta {
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
}

export interface NFTId {
  id: string;
  chainId: ChainId['id'];
  chainType: ChainType;
}

export interface EvmERC721Token extends NFTId {
  tokenId: string;
  tokenType: typeof TOKEN_TYPE.ERC721;
  contractAddress: string;
}

export interface EvmERC1155Token extends NFTId {
  tokenId: string;
  tokenType: typeof TOKEN_TYPE.ERC1155;
  contractAddress: string;
}

export type EvmNFT = EvmERC721Token | EvmERC1155Token;

export interface SuiNFT extends NFTId {
  objectId: string;
}

export interface IotaNFT extends NFTId {
  objectId: string;
}

export interface CosmosNFT extends NFTId {
  tokenId: string;
  tokenType: 'CW721';
  contractAddress: string;
}

export interface AccountNFTs {
  cosmosAccountNFT: CosmosNFT[];
  evmAccountNFT: EvmNFT[];
  suiAccountNFT: SuiNFT[];
  iotaAccountNFT: IotaNFT[];
}

export type FlatAccountNFT = CosmosNFT | EvmNFT | SuiNFT | IotaNFT;

export interface AccountAddressSuiNFT {
  id: string;
  chainId: ChainId['id'];
  chainType: ChainType;
  address: string;
  nftObjects: SuiNFTMeta[];
}
