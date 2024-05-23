import type { ACCOUNT_TYPE, CURRENCY_TYPE, LANGUAGE_TYPE } from '~/constants/extensionStorage';
import type { PERMISSION } from '~/constants/sui';
import type { AptosNetwork, BIP44, Chain, CommonChain, CosmosToken, EthereumNetwork, EthereumToken, SuiNetwork } from '~/types/chain';
import type { TransportType } from '~/types/ledger';
import type { Path } from '~/types/route';
import type { ThemeType } from '~/types/theme';

import type { CosmosNFT } from './cosmos/nft';
import type { EthereumNFT } from './ethereum/nft';
import type { RequestMessage } from './message';

export type AccountType = ValueOf<typeof ACCOUNT_TYPE>;
export type LanguageType = ValueOf<typeof LANGUAGE_TYPE>;
export type CurrencyType = ValueOf<typeof CURRENCY_TYPE>;
export type SuiPermissionType = ValueOf<typeof PERMISSION>;

export type HomeTabPath = {
  ethereum: number;
  cosmos: number;
  sui: number;
  aptos: number;
};

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
  mediblocPublicKey?: string;
  cryptoOrgPublicKey?: string;
  suiPublicKey?: string;
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

export type Providers = {
  keplr: boolean;
  metamask: boolean;
  aptos: boolean;
};

export type SuiPermission = {
  id: string;
  origin: AllowedOrigin['origin'];
  accountId: Account['id'];
  permission: SuiPermissionType;
};

export type ExtensionStorage = {
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
  homeTabIndex: HomeTabPath;

  selectedAccountId: Account['id'];

  allowedOrigins: AllowedOrigin[];
  allowedChainIds: Chain['id'][];

  shownEthereumNetworkIds: EthereumNetwork['id'][];
  shownAptosNetworkIds: AptosNetwork['id'][];
  shownSuiNetworkIds: SuiNetwork['id'][];

  selectedChainId: Chain['id'];

  additionalEthereumNetworks: EthereumNetwork[];
  selectedEthereumNetworkId: EthereumNetwork['id'];

  additionalAptosNetworks: AptosNetwork[];
  selectedAptosNetworkId: AptosNetwork['id'];

  additionalSuiNetworks: SuiNetwork[];
  selectedSuiNetworkId: SuiNetwork['id'];

  cosmosTokens: CosmosToken[];
  ethereumTokens: EthereumToken[];

  ethereumNFTs: EthereumNFT[];
  cosmosNFTs: CosmosNFT[];

  suiPermissions: SuiPermission[];

  ledgerTransportType: TransportType;

  providers: Providers;

  address: Record<string, string | undefined>;
};

export type ExtensionStorageKeys = keyof ExtensionStorage;

export type Password = {
  key: string;
  value: string;
  time: number;
};

export type ExtensionSessionStorage = {
  password: Password | null;
};

export type ExtensionSessionStorageKeys = keyof ExtensionSessionStorage;
