import type { ACCOUNT_TYPE, LANGUAGE_TYPE } from '~/constants/chromeStorage';
import type { ThemeType } from '~/types/theme';

import type { BIP44, Chain, EthereumNetwork } from './chain';
import type { RequestMessage } from './message';

export type AccountType = ValueOf<typeof ACCOUNT_TYPE>;
export type LanguageType = ValueOf<typeof LANGUAGE_TYPE>;

export type AccountCommon = {
  id: string;
};

export type AllowedOrigin = { accountId: string; origin: string };
export type AllowedChain = { accountId: string; chainId: string };

export type SelectedChainId = Record<AccountCommon['id'], string>;
export type SelectedEthereumNetworkId = Record<AccountCommon['id'], string>;

export type AccountName = Record<AccountCommon['id'], string>;

export type MnemonicAccount = {
  type: typeof ACCOUNT_TYPE.MNEMONIC;
  encryptedMnemonic: string;
  bip44: Omit<BIP44, 'purpose' | 'coinType' | 'account' | 'change'>;
};

export type PrivateKeyAccount = {
  type: typeof ACCOUNT_TYPE.PRIVATE_KEY;
  encryptedPrivateKey: string;
};

export type Account = AccountCommon & (MnemonicAccount | PrivateKeyAccount);

export type Queue = {
  tabId?: number;
  origin: string;
  messageId: string;
  message: RequestMessage;
};

export type ChromeStorage = {
  encryptedPassword: string | null;
  accounts: Account[];
  accountName: AccountName;
  queues: Queue[];
  theme: ThemeType;
  windowId: number | null;
  additionalChains: Chain[];
  additionalEthereumNetworks: EthereumNetwork[];
  selectedAccountId: string;
  language: LanguageType;

  allowedOrigins: AllowedOrigin[];
  allowedChains: AllowedChain[];
  selectedChainId: SelectedChainId;
  selectedEthereumNetworkId: SelectedEthereumNetworkId;
};

export type ChromeStorageKeys = keyof ChromeStorage;
