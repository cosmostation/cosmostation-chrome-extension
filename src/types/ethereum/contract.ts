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

export type ERC20ContractBalanceOfPayload = string;

export type ERC20ContractBalancesOfPayload = {
  id: string;
  balance: ERC20ContractBalanceOfPayload;
};
