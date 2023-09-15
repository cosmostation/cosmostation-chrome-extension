export const PERMISSION = {
  VIEW_ACCOUNT: 'viewAccount',
  SUGGEST_TRANSACTIONS: 'suggestTransactions',
} as const;

export const SUI_COIN = '0x2::sui::SUI';

export const SUI_TOKEN_TEMPORARY_DECIMALS = 9;

export const TRANSACTION_RESULT = {
  SUCCESS: 'success',
  FAILURE: 'failure',
} as const;
