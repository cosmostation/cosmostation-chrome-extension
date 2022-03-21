export const TENDERMINT_POPUP_METHOD_TYPE = {
  TEN__REQUEST_ACCOUNTS: 'ten_requestAccounts',
} as const;

export const TENDERMINT_NO_POPUP_METHOD_TYPE = {
  TEN__ACCOUNT: 'ten_account',
} as const;

export const TENDERMINT_METHOD_TYPE = {
  ...TENDERMINT_POPUP_METHOD_TYPE,
  ...TENDERMINT_NO_POPUP_METHOD_TYPE,
} as const;
