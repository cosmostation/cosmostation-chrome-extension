export const COSMOS_LISTENER_TYPE = {
  ACCOUNT_CHANGED: 'accountChanged',
} as const;

export const ETHEREUM_LISTENER_TYPE = {
  ACCOUNTS_CHANGED: 'accountsChanged',
  CHAIN_CHANGED: 'chainChanged',
} as const;

export const APTOS_LISTENER_TYPE = {
  ACCOUNT_CHANGED: 'accountChange',
  CHAIN_CHANGED: 'networkChange',
} as const;

export const SUI_LISTENER_TYPE = {
  ACCOUNT_CHANGED: 'accountChange',
  CHAIN_CHANGED: 'networkChange',
} as const;

export const BITCOIN_LISTENER_TYPE = {
  ACCOUNT_CHANGED: 'accountChanged',
} as const;
