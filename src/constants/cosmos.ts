export const COSMOS_POPUP_METHOD_TYPE = {
  // legacy
  TEN__REQUEST_ACCOUNT: 'ten_requestAccount',
  TEN__ADD_CHAIN: 'ten_addChain',
  TEN__SIGN_AMINO: 'ten_signAmino',
  TEN__SIGN_DIRECT: 'ten_signDirect',

  COS__REQUEST_ACCOUNT: 'cos_requestAccount',
  COS__ADD_CHAIN: 'cos_addChain',
  COS__SIGN_AMINO: 'cos_signAmino',
  COS__SIGN_DIRECT: 'cos_signDirect',
  COS__GET_AUTO_SIGN: 'cos_getAutoSign',
  COS__SET_AUTO_SIGN: 'cos_setAutoSign',
  COS__DELETE_AUTO_SIGN: 'cos_deleteAutoSign',
  COS__ADD_TOKENS_CW20: 'cos_addTokensCW20',
  COS__ADD_TOKENS_CW20_INTERNAL: 'cos_addTokensCW20Internal',
} as const;

export const COSMOS_NO_POPUP_METHOD_TYPE = {
  // legacy
  TEN__SUPPORTED_CHAIN_NAMES: 'ten_supportedChainNames',
  TEN__ACCOUNT: 'ten_account',

  COS__SUPPORTED_CHAIN_NAMES: 'cos_supportedChainNames',
  COS__ACTIVATED_CHAIN_NAMES: 'cos_activatedChainNames',
  COS__ACCOUNT: 'cos_account',
  COS__SEND_TRANSACTION: 'cos_sendTransaction',
  COS__GET_BALANCE_CW20: 'cos_getBalanceCW20',
  COS__GET_TOKEN_INFO_CW20: 'cos_getTokenInfoCW20',
} as const;

export const COSMOS_METHOD_TYPE = {
  ...COSMOS_POPUP_METHOD_TYPE,
  ...COSMOS_NO_POPUP_METHOD_TYPE,
} as const;

export const PUBLIC_KEY_TYPE = {
  SECP256K1: 'tendermint/PubKeySecp256k1',
  ETH_SECP256K1: 'ethermint/PubKeyEthSecp256k1',
  INJ_SECP256K1: 'injective/PubKeyEthSecp256k1',
} as const;

export const COSMOS_TYPE = {
  BASIC: '',
  ETHERMINT: 'ETHERMINT',
} as const;

export const MINTSCAN_URL = 'https://www.mintscan.io';

export const TOKEN_TYPE = {
  CW20: 'CW20',
} as const;
