export const TENDERMINT_POPUP_METHOD_TYPE = {
  TEN__SUPPORTED_CHAIN_NAMES: 'ten_supportedChainNames',
  TEN__REQUEST_ACCOUNTS: 'ten_requestAccounts',
  TEN__ADD_CHAIN: 'ten_addChain',
  TEN__SIGN_AMINO: 'ten_signAmino',
  TEN__SIGN_DIRECT: 'ten_signDirect',
  TEN__TEST: 'ten_test',
} as const;

export const TENDERMINT_NO_POPUP_METHOD_TYPE = {
  TEN__ACCOUNT: 'ten_account',
} as const;

export const TENDERMINT_METHOD_TYPE = {
  ...TENDERMINT_POPUP_METHOD_TYPE,
  ...TENDERMINT_NO_POPUP_METHOD_TYPE,
} as const;

export const PUBLIC_KEY_TYPE = {
  SECP256K1: 'tendermint/PubKeySecp256k1',
};
