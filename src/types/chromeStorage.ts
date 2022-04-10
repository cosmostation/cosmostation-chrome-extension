import type { ACCOUNT_TYPE, CURRENCY_TYPE, LANGUAGE_TYPE } from '~/constants/chromeStorage';
import type { Path } from '~/types/route';
import type { ThemeType } from '~/types/theme';

import type { BIP44, Chain, CommonChain, EthereumNetwork } from './chain';
import type { RequestMessage } from './message';

export type AccountType = ValueOf<typeof ACCOUNT_TYPE>;
export type LanguageType = ValueOf<typeof LANGUAGE_TYPE>;
export type CurrencyType = ValueOf<typeof CURRENCY_TYPE>;

export type AccountCommon = {
  id: string;
  encryptedPassword: string;
  encryptedRestoreString: string;
};

export type AllowedOrigin = { accountId: AccountCommon['id']; origin: string };

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

export type Queue<T = RequestMessage> = {
  tabId?: number;
  windowId?: number;
  origin: string;
  messageId: string;
  message: T;
  channel?: 'ten_send';
};

export type AddressInfo = {
  id: string;
  chainId: CommonChain['id'];
  label: string;
  address: string;
  memo?: string;
};

export type ChromeStorage = {
  encryptedPassword: string | null;
  accounts: Account[];
  accountName: AccountName;
  queues: Queue[];
  theme: ThemeType;
  currency: CurrencyType;
  windowId: number | null;
  additionalChains: Chain[];
  additionalEthereumNetworks: EthereumNetwork[];
  language: LanguageType;
  addressBook: AddressInfo[];

  rootPath: Path;

  selectedAccountId: string;

  allowedOrigins: AllowedOrigin[];
  allowedChainIds: string[];
  selectedChainId: string;
  selectedEthereumNetworkId: string;

  password: string | null;
};

export type ChromeStorageKeys = keyof ChromeStorage;
