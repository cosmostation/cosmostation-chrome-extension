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
