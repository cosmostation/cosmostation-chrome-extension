import type { ContractSendMethod } from 'web3-eth-contract';

export type ERC20ContractMethods = {
  balanceOf: (ethAddress: string) => ContractSendMethod;
  name: () => ContractSendMethod;
  decimals: () => ContractSendMethod;
  symbol: () => ContractSendMethod;
  approve: (spender: string, amount: string) => ContractSendMethod;
  transfer: (to: string, amount: string) => ContractSendMethod;
  transferFrom: (from: string, to: string, amount: string) => ContractSendMethod;
};

export type ERC721ContractMethods = {
  balanceOf: (ethAddress: string) => ContractSendMethod;
  ownerOf: (tokenId: string) => ContractSendMethod;
  safeTransferFrom: (from: string, to: string, tokenId: string, data?: string) => ContractSendMethod;
  transferFrom: (from: string, to: string, tokenId: string) => ContractSendMethod;
  approve: (approved: string, tokenId: string) => ContractSendMethod;
  setApprovalForAll: (operator: string, approved: boolean) => ContractSendMethod;
  getApproved: (tokenId: string) => ContractSendMethod;
  isApprovedForAll: (owner: string, operator: string) => ContractSendMethod;
  supportsInterface: (interfaceId: string) => ContractSendMethod;
  // FIXME index를 숫자가 아닌 스트링으로 한번 바꿨는데 아니면 숫자로 바꿀것
  // NOTE optional 메서드라 지원하는 컨트랙이 있고 아닌 컨트랙이 있음
  // NOTE Interface로 721인지 1155인지 구분지어 놓고 메서드 호출!
  // NOTE 인터페이스로 구분지을 수 있는 먼저 테스트 후 작업 진행
  tokenOfOwnerByIndex: (owner: string, index: number) => ContractSendMethod;
  tokenURI: (tokenId: string) => ContractSendMethod;
};

export type ERC1155ContractMethods = {
  balanceOf: (account: string, id: string) => ContractSendMethod;
  balanceOfBatch: (accounts: string[], ids: string[]) => ContractSendMethod;
  isApprovedForAll: (account: string, operator: string) => ContractSendMethod;
  safeBatchTransferFrom: (from: string, to: string, ids: string[], amounts: string[], data: string | number[]) => ContractSendMethod;
  safeTransferFrom: (from: string, to: string, id: string, amount: string, data: string | number[]) => ContractSendMethod;
  setApprovalForAll: (operator: string, approved: boolean) => ContractSendMethod;
  supportsInterface: (interfaceId: string | number[]) => ContractSendMethod;
  uri: (id: string) => ContractSendMethod;
};

export type ERC20ContractBalanceOfPayload = string;

export type ERC20ContractBalancesOfPayload = {
  id: string;
  balance: ERC20ContractBalanceOfPayload;
};

export type ERC721BalanceOfPayload = string;

export type ERC721URIPayload = string;

export type ERC721CheckPayload = boolean;

export type ERC721OwnerPayload = string;

export type ERC721TokenOfOwnerByIndexPayload = string;

export type ERC1155URIPayload = string;

export type ERC1155CheckPayload = boolean;

export type ERC1155BalanceOfPayload = string;
