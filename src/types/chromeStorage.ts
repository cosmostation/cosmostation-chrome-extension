import type { ACCOUNT_TYPE, CURRENCY_TYPE, LANGUAGE_TYPE } from '~/constants/chromeStorage';
import type { AptosNetwork, BIP44, Chain, CommonChain, CosmosToken, EthereumNetwork, EthereumToken } from '~/types/chain';
import type { TransportType } from '~/types/ledger';
import type { Path } from '~/types/route';
import type { ThemeType } from '~/types/theme';

import type { RequestMessage } from './message';

export type AccountType = ValueOf<typeof ACCOUNT_TYPE>;
export type LanguageType = ValueOf<typeof LANGUAGE_TYPE>;
export type CurrencyType = ValueOf<typeof CURRENCY_TYPE>;

export type AccountCommon = {
  id: string;
};

export type AllowedOrigin = { accountId: AccountCommon['id']; origin: string };

export type AccountName = Record<AccountCommon['id'], string>;

export type MnemonicAccount = {
  type: typeof ACCOUNT_TYPE.MNEMONIC;
  encryptedMnemonic: string;
  bip44: Omit<BIP44, 'purpose' | 'coinType' | 'account' | 'change'>;
  encryptedPassword: string;
  encryptedRestoreString: string;
};

export type PrivateKeyAccount = {
  type: typeof ACCOUNT_TYPE.PRIVATE_KEY;
  encryptedPrivateKey: string;
  encryptedPassword: string;
  encryptedRestoreString: string;
};

export type LedgerAccount = {
  type: typeof ACCOUNT_TYPE.LEDGER;
  bip44: Omit<BIP44, 'purpose' | 'coinType' | 'account' | 'change'>;

  cosmosPublicKey?: string;
  ethereumPublicKey?: string;
};

export type Account = AccountCommon & (MnemonicAccount | PrivateKeyAccount | LedgerAccount);

export type AccountWithName = Account & { name: string };

export type Queue<T = RequestMessage> = {
  tabId?: number;
  windowId?: number;
  origin: string;
  messageId: string;
  message: T;
  channel?: 'inApp';
};

export type AddressInfo = {
  id: string;
  chainId: CommonChain['id'];
  label: string;
  address: string;
  memo?: string;
};

export type AutoSign = {
  id: string;
  accountId: Account['id'];
  chainId: Chain['id'];
  origin: string;
  startTime: number;
  duration: number;
};

export type Providers = {
  keplr: boolean;
  metamask: boolean;
  aptos: boolean;
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
  language: LanguageType;
  addressBook: AddressInfo[];

  rootPath: Path;

  selectedAccountId: Account['id'];

  allowedOrigins: AllowedOrigin[];
  allowedChainIds: Chain['id'][];

  shownEthereumNetworkIds: EthereumNetwork['id'][];
  shownAptosNetworkIds: AptosNetwork['id'][];

  selectedChainId: Chain['id'];

  additionalEthereumNetworks: EthereumNetwork[];
  selectedEthereumNetworkId: EthereumNetwork['id'];

  additionalAptosNetworks: AptosNetwork[];
  selectedAptosNetworkId: AptosNetwork['id'];

  cosmosTokens: CosmosToken[];
  ethereumTokens: EthereumToken[];

  autoSigns: AutoSign[];

  ledgerTransportType: TransportType;

  providers: Providers;
};

export type ChromeStorageKeys = keyof ChromeStorage;

export type Password = {
  key: string;
  value: string;
  time: number;
};

export type ChromeSessionStorage = {
  password: Password | null;
};

export type ChromeSessionStorageKeys = keyof ChromeSessionStorage;
