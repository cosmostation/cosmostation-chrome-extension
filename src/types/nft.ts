import type { TOKEN_TYPE as ETHEREUM_TOKEN_TYPE } from '~/constants/ethereum';

export type EthereumERC721Token = {
  id: string;
  tokenId: string;
  ethereumNetworkId: string;
  tokenType: typeof ETHEREUM_TOKEN_TYPE.ERC721;
  address: string;
  name?: string;
  description?: string;
  imageURL?: string;
  metaURI?: string;
  rarity?: string;
};

export type EthereumERC1155Token = {
  id: string;
  tokenId: string;
  ethereumNetworkId: string;
  tokenType: typeof ETHEREUM_TOKEN_TYPE.ERC1155;
  address: string;
  name?: string;
  description?: string;
  imageURL?: string;
  metaURI?: string;
  rarity?: string;
};

export type EthereumNFT = EthereumERC721Token | EthereumERC1155Token;
