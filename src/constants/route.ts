export const PATH = {
  HOME: '/',

  DASHBOARD: '/dashboard',

  WALLET: '/wallet',
  WALLET__SEND: '/wallet/send',
  WALLET__SWAP: '/wallet/swap',
  WALLET__OSMOSIS_SWAP: '/wallet/osmosis-swap',
  WALLET__RECEIVE: '/wallet/receive',
  WALLET__NFT_DETAIL: '/wallet/nft-detail',
  WALLET__NFT_SEND: '/wallet/nft-send',

  SETTING__CHANGE_PASSWORD: '/setting/change-password',
  SETTING__CHANGE_LANGUAGE: '/setting/change-language',
  SETTING__CHANGE_CURRENCY: '/setting/change-currency',
  SETTING__ADDRESS_BOOK: '/setting/address-book',
  SETTING__ADDRESS_BOOK__ADD: '/setting/address-book/add',
  SETTING__CONNECTED_SITES: '/setting/connected-sites',
  SETTING__AUTO_SIGN: '/setting/auto-sign',
  SETTING__LEDGER: '/setting/ledger',
  SETTING__PROVIDER: '/setting/provider',

  CHAIN__MANAGEMENT: '/chain/management',
  CHAIN__MANAGEMENT__USE: '/chain/management/use',

  CHAIN__COSMOS__CHAIN__ADD: '/chain/cosmos/chain/add',
  CHAIN__COSMOS__TOKEN__ADD__CW20: '/chain/cosmos/token/add/cw20',
  CHAIN__COSMOS__TOKEN__ADD__CW20__SEARCH: '/chain/cosmos/token/add/cw20/search',
  CHAIN__COSMOS__NFT__ADD__CW721: '/chain/cosmos/nft/add/cw721',
  CHAIN__COSMOS__NFT__ADD__CW721__SEARCH: '/chain/cosmos/nft/add/cw721/search',

  CHAIN__ETHEREUM__TOKEN__ADD__ERC20: '/chain/ethereum/token/add/erc20',
  CHAIN__ETHEREUM__TOKEN__ADD__ERC20__SEARCH: '/chain/ethereum/token/add/erc20/search',
  CHAIN__ETHEREUM__NFT__ADD: '/chain/ethereum/nft/add',
  CHAIN__ETHEREUM__NETWORK__ADD: '/chain/ethereum/network/add',

  CHAIN__APTOS__COIN__ADD: '/chain/aptos/coin/add',

  ACCOUNT__MANAGEMENT: '/account/management',
  ACCOUNT__CREATE: '/account/create',
  ACCOUNT__INITIALIZE: '/account/initialize',
  ACCOUNT__INITIALIZE__WELCOME: '/account/initialize/welcome',
  ACCOUNT__INITIALIZE__COMPLETE: '/account/initialize/complete',
  ACCOUNT__INITIALIZE__IMPORT: '/account/initialize/import',
  ACCOUNT__INITIALIZE__IMPORT__MNEMONIC: '/account/initialize/import/mnemonic',
  ACCOUNT__INITIALIZE__IMPORT__PRIVATE_KEY: '/account/initialize/import/private-key',
  ACCOUNT__INITIALIZE__IMPORT__STEP2: '/account/initialize/import/step2',
  ACCOUNT__INITIALIZE__IMPORT__STEP3: '/account/initialize/import/step3',
  ACCOUNT__INITIALIZE__NEW__MNEMONIC__STEP1: '/account/initialize/new/mnemonic/step1',
  ACCOUNT__INITIALIZE__NEW__MNEMONIC__STEP2: '/account/initialize/new/mnemonic/step2',
  ACCOUNT__INITIALIZE__NEW__MNEMONIC__STEP3: '/account/initialize/new/mnemonic/step3',
  ACCOUNT__INITIALIZE__NEW__MNEMONIC__STEP4: '/account/initialize/new/mnemonic/step4',
  ACCOUNT__INITIALIZE__NEW__MNEMONIC__STEP5: '/account/initialize/new/mnemonic/step5',
  ACCOUNT__CREATE__NEW__MNEMONIC__STEP1: '/account/create/new/mnemonic/step1',
  ACCOUNT__CREATE__NEW__MNEMONIC__STEP2: '/account/create/new/mnemonic/step2',
  ACCOUNT__CREATE__NEW__MNEMONIC__STEP3: '/account/create/new/mnemonic/step3',
  ACCOUNT__CREATE__NEW__LEDGER: '/account/create/new/ledger',
  ACCOUNT__CREATE__IMPORT__MNEMONIC: '/account/create/import/mnemonic',
  ACCOUNT__CREATE__IMPORT__PRIVATE_KEY: '/account/create/import/private-key',

  REGISTER: '/register',
  REGISTER__PASSWORD: '/register/password',
  REGISTER__ACCOUNT: '/register/account',
  REGISTER__ACCOUNT__MNEMONIC: '/register/account/mnemonic',
  REGISTER__ACCOUNT__PRIVATE_KEY: '/register/account/private-key',
  REGISTER__ACCOUNT__NEW: '/register/account/new',

  // popup common
  POPUP__REQUEST_ACCOUNT: '/popup/request-account',

  // popup cosmos
  POPUP__COSMOS__ADD_CHAIN: '/popup/cosmos/add-chain',
  POPUP__COSMOS__ADD_TOKENS: '/popup/cosmos/add-tokens',
  POPUP__COSMOS__ADD_NFTS: '/popup/cosmos/add-nfts',
  POPUP__COSMOS__AUTO_SIGN__SET: '/popup/cosmos/auto-sign/set',
  POPUP__COSMOS__AUTO_SIGN__GET: '/popup/cosmos/auto-sign/get',
  POPUP__COSMOS__AUTO_SIGN__DELETE: '/popup/cosmos/auto-sign/delete',
  POPUP__COSMOS__SIGN__AMINO: '/popup/cosmos/sign/amino',
  POPUP__COSMOS__SIGN__DIRECT: '/popup/cosmos/sign/direct',
  POPUP__COSMOS__SIGN__MESSAGE: '/popup/cosmos/sign/message',

  // popup ethereum
  POPUP__ETHEREUM__ADD_NETWORK: '/popup/ethereum/add-network',
  POPUP__ETHEREUM__SWITCH_NETWORK: '/popup/ethereum/switch-network',
  POPUP__ETHEREUM__SIGN: '/popup/ethereum/sign',
  POPUP__ETHEREUM__SIGN_TYPED_DATA: '/popup/ethereum/sign-typed-data',
  POPUP__ETHEREUM__PERSONAL_SIGN: '/popup/ethereum/personal-sign',
  POPUP__ETHEREUM__TRANSACTION: '/popup/ethereum/transaction',
  POPUP__ETHEREUM__ADD_TOKENS: '/popup/ethereum/add-tokens',

  // popup aptos
  POPUP__APTOS__TRANSACTION: '/popup/aptos/transaction',
  POPUP__APTOS__SIGN_MESSAGE: '/popup/aptos/sign-message',

  // popup sui
  POPUP__SUI__TRANSACTION: '/popup/sui/transaction',
  POPUP__SUI__SIGN_MESSAGE: '/popup/sui/sign-message',

  POPUP__TX_RECEIPT: '/popup/tx-receipt',
} as const;
