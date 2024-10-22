export const BITCOIN_POPUP_METHOD_TYPE = {
  BIT__SIGN_AND_SEND_TRANSACTION: 'bit_signAndSendTransaction',
} as const;

export const BITCOIN_NO_POPUP_METHOD_TYPE = {} as const;

export const BITCOIN_METHOD_TYPE = {
  ...BITCOIN_POPUP_METHOD_TYPE,
  ...BITCOIN_NO_POPUP_METHOD_TYPE,
} as const;
