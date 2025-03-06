import type { TransactionDescription } from 'ethers/abi';

import type { EthereumContractKind, EthereumTxType } from './common';

export interface AccountTxsPayload {
  txs?: AccountTx[];
  search_after?: string;
}

export interface AccountTx {
  chainIndex?: string;
  txHash?: string;
  methodId?: string;
  nonce?: string;
  txTime?: string;
  from?: {
    address?: string;
    amount?: string;
  }[];
  to?: {
    address?: string;
    amount?: string;
  }[];
  tokenAddress?: string;
  amount?: string;
  symbol?: string;
  txFee?: string;
  txStatus?: 'success' | 'fail' | 'pending';
  hitBlacklist?: boolean;
  tag?: string;
  itype?: string;
}

export interface EthereumTx {
  value?: string | number;
  gasPrice?: string | number;
  maxPriorityFeePerGas?: string | number;
  maxFeePerGas?: string | number;
  from?: string;
  to?: string;
  gas?: number | string;
  data?: string;
  nonce?: number;
  v?: string | number;
  r?: string | number;
  s?: string | number;
}

export type DetermineTxType = {
  type: EthereumTxType;
  txDescription: TransactionDescription | null;
  contractKind?: EthereumContractKind;
  getCodeResponse: string | null;
};
