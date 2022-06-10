import type { ContractSendMethod } from 'web3-eth-contract';

export type ERC20ContractMethods = {
  balanceOf: (ethAddress: string) => ContractSendMethod;
  name: () => ContractSendMethod;
  decimals: () => ContractSendMethod;
  symbol: () => ContractSendMethod;
  approve: (spender: string, amount: string) => ContractSendMethod;
};

export type ERC20ContractBalanceOfPayload = string;
