export const PATH = {
  HOME: '/',

  DASHBOARD: '/dashboard',

  WALLET: '/wallet',
  WALLET__RECEIVE: '/wallet/receive',

  SETTING__CHANGE_PASSWORD: '/setting/change-password',
  SETTING__CHANGE_LANGUAGE: '/setting/change-language',
  SETTING__CHANGE_CURRENCY: '/setting/change-currency',

  CHAIN__MANAGEMENT: '/chain/management',
  CHAIN__MANAGEMENT__USE: '/chain/management/use',

  ACCOUNT__MANAGEMENT: '/account/management',
  ACCOUNT__CREATE: '/account/create',
  ACCOUNT__INITIALIZE: '/account/initialize',
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
  ACCOUNT__CREATE__IMPORT__MNEMONIC: '/account/create/import/mnemonic',
  ACCOUNT__CREATE__IMPORT__PRIVATE_KEY: '/account/create/import/private-key',

  RESTORE: '/restore',
  REGISTER: '/register',
  REGISTER__PASSWORD: '/register/password',
  REGISTER__ACCOUNT: '/register/account',
  REGISTER__ACCOUNT__MNEMONIC: '/register/account/mnemonic',
  REGISTER__ACCOUNT__PRIVATE_KEY: '/register/account/private-key',
  REGISTER__ACCOUNT__NEW: '/register/account/new',

  POPUP__REQUEST_ACCOUNT: '/popup/request-account',
  POPUP__TENDERMINT__ADD_CHAIN: '/popup/tendermint/add-chain',
  POPUP__TENDERMINT__SIGN__AMINO: '/popup/tendermint/sign/amino',
} as const;
