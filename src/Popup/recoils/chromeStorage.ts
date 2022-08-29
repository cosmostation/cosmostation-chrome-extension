import { atom } from 'recoil';

import { PATH } from '~/constants/route';
import { THEME_TYPE } from '~/constants/theme';
import type { ChromeStorage, CurrencyType, LanguageType } from '~/types/chromeStorage';

export const chromeStorageDefault: ChromeStorage = {
  theme: THEME_TYPE.LIGHT,
  accounts: [],
  accountName: {},
  queues: [],
  additionalChains: [],
  additionalEthereumNetworks: [],
  encryptedPassword: null,
  windowId: null,
  selectedAccountId: '',

  addressBook: [],

  language: '' as LanguageType,
  currency: '' as CurrencyType,

  rootPath: PATH.DASHBOARD,

  allowedChainIds: [],
  allowedOrigins: [],
  shownEthereumNetworkIds: [],
  selectedChainId: '',
  selectedEthereumNetworkId: '',

  ethereumTokens: [],
  cosmosTokens: [],

  autoSigns: [],

  ledgerTransportType: 'USB',

  providers: { keplr: true, metamask: true },
};

export const chromeStorageState = atom<ChromeStorage>({
  key: 'chromeStorageState',
  default: chromeStorageDefault,
});
