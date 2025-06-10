export const SOLANA_POPUP_METHOD_TYPE = {
  SOLANA__CONNECT: 'solana_connect',
  SOLANA__SIGN_MESSAGE: 'solana_signMessage',
  SOLANA__SIGN_TRANSACTION: 'solana_signTransaction',
  SOLANA__SIGN_ALL_TRANSACTIONS: 'solana_signAllTransactions',
  SOLANA__SIGN_AND_SEND_TRANSACTION: 'solana_signAndSendTransaction',
  SOLANA__SIGN_AND_SEND_ALL_TRANSACTIONS: 'solana_signAndSendAllTransactions',
} as const;

export const SOLANA_NO_POPUP_METHOD_TYPE = {
  SOLANA__DISCONNECT: 'solana_disconnect',
} as const;

export const SOLANA_METHOD_TYPE = {
  ...SOLANA_POPUP_METHOD_TYPE,
  ...SOLANA_NO_POPUP_METHOD_TYPE,
} as const;
