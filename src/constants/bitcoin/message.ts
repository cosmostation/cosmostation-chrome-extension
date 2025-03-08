export const BITCOIN_POPUP_METHOD_TYPE = {
  BIT__SWITCH_NETWORK: 'bit_switchNetwork',
  BIT__SEND_BITCOIN: 'bit_sendBitcoin',
  BIT__SIGN_MESSAGE: 'bit_signMessage',
  BIT__SIGN_PSBT: 'bit_signPsbt',
  BIT__SIGN_PSBTS: 'bit_signPsbts',
  BIT__REQUEST_ACCOUNT: 'bit_requestAccount',

  BITC__SWITCH_NETWORK: 'bitc_switchNetwork',
} as const;

export const BITCOIN_NO_POPUP_METHOD_TYPE = {
  BIT__GET_ADDRESS: 'bit_getAddress',
  BIT__GET_NETWORK: 'bit_getNetwork',
  BIT_GET_PUBLICKKEY_HEX: 'bit_getPublicKeyHex',
  BIT_GET_BALANCE: 'bit_getBalance',
  BIT_GET_INSCRIPTIONS: 'bit_getInscriptions',
  BIT__PUSH_TX: 'bit_pushTx',
} as const;

export const BITCOIN_METHOD_TYPE = {
  ...BITCOIN_POPUP_METHOD_TYPE,
  ...BITCOIN_NO_POPUP_METHOD_TYPE,
} as const;
