import { atom } from 'recoil';

import { ETHEREUM_NETWORKS } from '~/constants/chain';
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
  homeTabPath: {
    ethereum: [
      ...ETHEREUM_NETWORKS.map((network) => ({
        networkId: network.id,
        tabValue: 0,
      })),
    ],
    cosmos: {
      tabValue: 0,
    },
    sui: {
      tabValue: 0,
    },
    aptos: {
      tabValue: 0,
    },
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

  autoSigns: [],

  ledgerTransportType: 'HID',

  providers: { keplr: false, metamask: false, aptos: false },
};

export const extensionStorageState = atom<ExtensionStorage>({
  key: 'extensionStorageState',
  default: extensionStorageDefault,
});
