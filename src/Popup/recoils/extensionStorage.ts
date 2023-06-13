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
  tabPath: {
    ethereum: [
      ...ETHEREUM_NETWORKS.map((network) => ({
        networkId: network.id,
        tabPath: 0,
      })),
    ],
    cosmos: {
      tabPath: 0,
    },
    sui: {
      tabPath: 0,
    },
    aptos: {
      tabPath: 0,
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
