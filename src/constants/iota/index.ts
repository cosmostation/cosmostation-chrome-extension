export const PERMISSION = {
  VIEW_ACCOUNT: 'viewAccount',
  SUGGEST_TRANSACTIONS: 'suggestTransactions',
} as const;

export const IOTA_COIN_TYPE = '0x2::iota::IOTA';

export const IOTA_TOKEN_TEMPORARY_DECIMALS = 9;

export const TRANSACTION_RESULT = {
  SUCCESS: 'success',
  FAILURE: 'failure',
} as const;
