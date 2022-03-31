import { atom } from 'recoil';

import { PATH } from '~/constants/route';
import { THEME_TYPE } from '~/constants/theme';
import type { ChromeStorage, CurrencyType, LanguageType } from '~/types/chromeStorage';

export const chromeStorageState = atom<ChromeStorage>({
  key: 'chromeStorageState',
  default: {
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
    selectedChainId: '',
    selectedEthereumNetworkId: '',

    password: null,
  },
});
