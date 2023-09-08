export const ACCOUNT_TYPE = {
  MNEMONIC: 'MNEMONIC',
  PRIVATE_KEY: 'PRIVATE_KEY',
  LEDGER: 'LEDGER',
} as const;

export const LANGUAGE_TYPE = {
  KO: 'ko',
  EN: 'en',
} as const;

export const CURRENCY_TYPE = {
  USD: 'usd',
  KRW: 'krw',
  EUR: 'eur',
  JPY: 'jpy',
  CNY: 'cny',
  BTC: 'btc',
  ETH: 'eth',
} as const;

export const HOME_TAB_INDEX_TYPE = {
  ETHEREUM: 'ethereum',
  COSMOS: 'cosmos',
  SUI: 'sui',
  APTOS: 'aptos',
} as const;

export const COSMOS_ACTIVITY_TYPE = {
  SEND: 'send',
  IBC_SEND: 'ibcSend',
  SWAP: 'swap',
  REWARD: 'reward',
  COMMISSION: 'commission',
  CONTRACT: 'contract',
  CUSTOM: 'custom',
} as const;

export const ETHEREUM_ACTIVITY_TYPE = {
  APPROVE: 'approve',
  TRANSFER: 'transfer',
  TRANSFER_FROM: 'transferFrom',
  ERC721_TRANSFER_FROM: 'erc721TransferFrom',
  ERC1155_SAFE_TRANSFER_FROM: 'erc1155SafeTransferFrom',
  SIMPLE_SEND: 'simpleSend',
  DEPLOY: 'contractDeployment',
  SWAP: 'swap',
  UNO_SWAP: 'unoswap',
  CONTRACT_INTERACT: 'contractInteract',
} as const;

export const SUI_ACTIVITY_TYPE = {
  TRANSACTION: 'transaction',
} as const;

export const APTOS_ACTIVITY_TYPE = {
  TRANSACTION: 'transaction',
} as const;
