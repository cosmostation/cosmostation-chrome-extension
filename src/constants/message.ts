export const COSMOS_LISTENER_TYPE = {
  ACCOUNT_CHANGED: 'accountChanged',
} as const;

export const ETHEREUM_LISTENER_TYPE = {
  ACCOUNTS_CHANGED: 'accountsChanged',
  CHAIN_CHANGED: 'chainChanged',
  DISCONNECT: 'disconnect',
  CONNECT: 'connect',
} as const;

export const APTOS_LISTENER_TYPE = {
  ACCOUNT_CHANGED: 'accountChange',
  CHAIN_CHANGED: 'networkChange',
} as const;

export const SUI_LISTENER_TYPE = {
  ACCOUNT_CHANGED: 'accountChange',
  CHAIN_CHANGED: 'networkChange',
} as const;

export const IOTA_LISTENER_TYPE = {
  ACCOUNT_CHANGED: 'accountChange',
  CHAIN_CHANGED: 'networkChange',
} as const;

export const BITCOIN_LISTENER_TYPE = {
  ACCOUNT_CHANGED: 'accountChanged',
} as const;

export const COMMON_NO_POPUP_METHOD_TYPE = {
  COM__PROVIDERS: 'com_providers',
} as const;

export const COMMON_METHOD_TYPE = {
  ...COMMON_NO_POPUP_METHOD_TYPE,
} as const;
