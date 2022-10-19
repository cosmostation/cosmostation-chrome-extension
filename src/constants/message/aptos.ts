export const APTOS_POPUP_METHOD_TYPE = {
  APTOS__CONNECT: 'aptos_connect',
  APTOS__ACCOUNT: 'aptos_account',
  APTOS__SIGN_AND_SUBMIT_TRANSACTION: 'aptos_signAndSubmitTransaction',
  APTOS__SIGN_TRANSACION: 'aptos_signTransaction',
  APTOS__SIGN_MESSAGE: 'aptos_signMessage',
} as const;

export const APTOS_NO_POPUP_METHOD_TYPE = {
  APTOS__IS_CONNECTED: 'aptos_isConnected',
  APTOS__DISCONNECT: 'aptos_disconnect',
  APTOS__NETWORK: 'aptos_network',
} as const;

export const APTOS_METHOD_TYPE = {
  ...APTOS_POPUP_METHOD_TYPE,
  ...APTOS_NO_POPUP_METHOD_TYPE,
} as const;
