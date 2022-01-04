import type { ACCOUNT_COIN_TYPE, ACCOUNT_TYPE } from '~/constants/chromeStorage';
import type { ThemeType } from '~/types/theme';

import type { BIP44, Chain } from './chain';
import type { RequestMessage } from './message';

export type AccountType = ValueOf<typeof ACCOUNT_TYPE>;
export type AccountCoinType = ValueOf<typeof ACCOUNT_COIN_TYPE>;

export type AccountCommon = {
  id: string;
  name: string;
  allowedOrigins: string[];
};

export type LedgerAccount = {
  type: typeof ACCOUNT_TYPE.LEDGER;
  bip44: Omit<BIP44, 'purpose'>;
  publicKey: string;
};

export type MnemonicAccount = {
  type: typeof ACCOUNT_TYPE.MNEMONIC;
  encryptedMnemonic: string;
  coinType: AccountCoinType;
  bip44: Omit<BIP44, 'purpose' | 'coinType'>;
};

export type PrivateKeyAccount = {
  type: typeof ACCOUNT_TYPE.PRIVATE_KEY;
  encryptedPrivateKey: string;
};

export type Account = AccountCommon & (LedgerAccount | MnemonicAccount | PrivateKeyAccount);

export type Queue = {
  tabId?: number;
  origin: string;
  messageId: string;
  message: RequestMessage;
};

export type ChromeStorage = {
  encryptedPassword: string | null;
  accounts: Account[];
  queues: Queue[];
  theme: ThemeType;
  windowId: number | null;
  additionalChains: Chain[];
  selectedAccountId: string;
  selectedChain: string;
};

export type ChromeStorageKeys = keyof ChromeStorage;
