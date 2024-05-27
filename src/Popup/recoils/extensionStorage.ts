import { atom } from 'recoil';

import { PATH } from '~/constants/route';
import { THEME_TYPE } from '~/constants/theme';
import type { CurrencyType, ExtensionStorage, LanguageType } from '~/types/extensionStorage';

export const extensionStorageDefault: ExtensionStorage = {
  theme: THEME_TYPE.LIGHT,
  accounts: [],
  accountName: {},
  queues: [],
  additionalChains: [],
  additionalEthereumNetworks: [],
  additionalAptosNetworks: [],
  additionalSuiNetworks: [],

  encryptedPassword: null,
  windowId: null,
  selectedAccountId: '',

  addressBook: [],

  language: '' as LanguageType,
  currency: '' as CurrencyType,

  rootPath: PATH.DASHBOARD,
  homeTabIndex: {
    ethereum: 0,
    cosmos: 0,
    sui: 0,
    aptos: 0,
  },

  allowedChainIds: [],
  allowedOrigins: [],

  shownEthereumNetworkIds: [],
  shownAptosNetworkIds: [],
  shownSuiNetworkIds: [],

  selectedChainId: '',
  selectedEthereumNetworkId: '',
  selectedAptosNetworkId: '',
  selectedSuiNetworkId: '',

  suiPermissions: [],

  ethereumTokens: [],
  cosmosTokens: [],

  ethereumNFTs: [],
  cosmosNFTs: [],

  ledgerTransportType: 'HID',

  providers: { keplr: false, metamask: false, aptos: false },

  address: {},
};

export const extensionStorageState = atom<ExtensionStorage>({
  key: 'extensionStorageState',
  default: extensionStorageDefault,
});
