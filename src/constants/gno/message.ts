export const GNO_POPUP_METHOD_TYPE = {
  GNO__CONNECT: 'gno_connect',
  GNO__GET_ACCOUNT: 'gno_getAccount',
  GNO__SIGN_AND_SEND_TRANSACTION: 'gno_signAndSendTransaction',
  GNO__SIGN_TRANSACTION: 'gno_signTransaction',
  GNO__SIGN_MESSAGE: 'gno_signMessage',
  GNO__SWITCH_NETWORK: 'gno_switchNetwork',
} as const;

export const GNO_NO_POPUP_METHOD_TYPE = {
  GNO__GET_NETWORK: 'gno_getNetwork',
} as const;

export const GNO_METHOD_TYPE = {
  ...GNO_POPUP_METHOD_TYPE,
  ...GNO_NO_POPUP_METHOD_TYPE,
} as const;
