/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Network } from 'bitcoinjs-lib';

import { PUBKEY_STYLE, PUBKEY_TYPE_MAP } from '@/constants/cosmos';
import { COSMOS_DEFAULT_GAS, DEFAULT_GAS_MULTIPLY } from '@/constants/cosmos/gas';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { LANGUAGE_TYPE } from '@/constants/language';
import { getChains } from '@/libs/chain';
import { v11 } from '@/script/service-worker/update/v11';
import type { Account as NewAccount, AccountNamesById, MnemonicAccount as NewMnemonicAccount, PrivateAccount as NewPrivateAccount } from '@/types/account';
import type { CustomCosmosAsset, CustomEvmAsset } from '@/types/asset';
import type { CustomCosmosChain, CustomEvmChain } from '@/types/chain';
import type { CurrencyType as NewCurrencyType } from '@/types/currency';
import type { ExtensionStorageKeys, PrioritizedProvider } from '@/types/extension';
import { getUniqueChainId } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage, setExtensionLocalStorage } from '@/utils/storage';
import { initialState, notDeleteKeys } from '@/zustand/hooks/useExtensionStorageStore';
import { setLoadingProgressBarStore } from '@/zustand/hooks/useLoadingProgressBar';

const ACCOUNT_TYPE = {
  MNEMONIC: 'MNEMONIC',
  PRIVATE_KEY: 'PRIVATE_KEY',
  LEDGER: 'LEDGER',
} as const;

type LANGUAGE_TYPE = {
  KO: 'ko';
  EN: 'en';
};

type CURRENCY_TYPE = {
  USD: 'usd';
  KRW: 'krw';
  EUR: 'eur';
  JPY: 'jpy';
  CNY: 'cny';
  BTC: 'btc';
  ETH: 'eth';
};

type HOME_TAB_INDEX_TYPE = {
  ETHEREUM: 'ethereum';
  COSMOS: 'cosmos';
  SUI: 'sui';
  APTOS: 'aptos';
  BITCOIN: 'bitcoin';
};

type CurrencyType = CURRENCY_TYPE[keyof CURRENCY_TYPE];
type LanguageType = LANGUAGE_TYPE[keyof LANGUAGE_TYPE];
type HomeTabPath = HOME_TAB_INDEX_TYPE[keyof HOME_TAB_INDEX_TYPE];

type AccountCommon = {
  id: string;
};

type BIP44 = {
  purpose: string;
  coinType: string;
  account: string;
  change: string;
  addressIndex: string;
};

type MnemonicAccount = {
  type: typeof ACCOUNT_TYPE.MNEMONIC;
  encryptedMnemonic: string;
  bip44: Omit<BIP44, 'purpose' | 'coinType' | 'account' | 'change'>;
  encryptedPassword: string;
  encryptedRestoreString: string;
};

type PrivateKeyAccount = {
  type: typeof ACCOUNT_TYPE.PRIVATE_KEY;
  encryptedPrivateKey: string;
  encryptedPassword: string;
  encryptedRestoreString: string;
};

type LedgerAccount = {
  type: typeof ACCOUNT_TYPE.LEDGER;
  bip44: Omit<BIP44, 'purpose' | 'coinType' | 'account' | 'change'>;

  cosmosPublicKey?: string;
  ethereumPublicKey?: string;
  mediblocPublicKey?: string;
  cryptoOrgPublicKey?: string;
  suiPublicKey?: string;
  bitcoinPublicKey?: string;
};

type LegacyAccount = AccountCommon & (MnemonicAccount | PrivateKeyAccount | LedgerAccount);

type AllowedOrigin = { accountId: AccountCommon['id']; origin: string };

type AccountName = Record<AccountCommon['id'], string>;
type LINE_TYPE = {
  BITCOIN: 'BITCOIN';
  COSMOS: 'COSMOS';
  ETHEREUM: 'ETHEREUM';
  APTOS: 'APTOS';
  SUI: 'SUI';
  COMMON: 'COMMON';
};

type CommonChain = {
  id: string;
  chainName: string;
  bip44: Omit<BIP44, 'addressIndex'>;
  tokenImageURL?: string;
  imageURL?: string;
};

type COSMOS_TYPE = {
  BASIC: '';
  ETHERMINT: 'ETHERMINT';
};
type CosmosType = COSMOS_TYPE[keyof COSMOS_TYPE];

type CosmosChain = {
  line: LINE_TYPE['COSMOS'];
  isTerminated?: boolean;
  type: CosmosType;
  chainId: string;
  baseDenom: string;
  displayDenom: string;
  restURL: string;
  decimals: number;
  bech32Prefix: {
    address: string;
  };
  coinGeckoId?: string;
  explorerURL?: string;
  gasRate: GasRate;
  gas: Gas;
  cosmWasm?: boolean;
  custom?: 'no-stake';
} & CommonChain;

type GasRate = {
  tiny: string;
  low: string;
  average: string;
};

type Gas = {
  send?: string;
  ibcSend?: string;
  transfer?: string;
  ibcTransfer?: string;
};

type EthereumChain = {
  line: LINE_TYPE['ETHEREUM'];
} & CommonChain;

type EthereumNetwork = {
  id: string;
  chainId: string;
  networkName: string;
  displayDenom: string;
  decimals: number;
  rpcURL: string;
  tokenImageURL?: string;
  imageURL?: string;
  explorerURL?: string;
  coinGeckoId?: string;
};

type AptosChain = {
  line: LINE_TYPE['APTOS'];
} & CommonChain;

type SuiChain = {
  line: LINE_TYPE['SUI'];
  chainName: string;
} & CommonChain;

type BitcoinChain = {
  line: LINE_TYPE['BITCOIN'];
  chainName: string;
  rpcURL: string;
  displayDenom: string;
  explorerURL?: string;
  coinGeckoId?: string;
  decimals: number;
  mempoolURL: string;
  network?: Network;
  isTestnet?: boolean;
  isSignet?: boolean;
} & CommonChain;

type Chain = CosmosChain | EthereumChain | AptosChain | SuiChain | BitcoinChain;

type AddressInfo = {
  id: string;
  chainId: CommonChain['id'];
  label: string;
  address: string;
  memo?: string;
};

type TOKEN_TYPE = {
  ERC20: 'ERC20';
  ERC721: 'ERC721';
  ERC1155: 'ERC1155';
};

type EthereumERC721Token = {
  id: string;
  tokenId: string;
  ethereumNetworkId: string;
  tokenType: TOKEN_TYPE['ERC721'];
  ownerAddress: string;
  address: string;
};

type EthereumERC1155Token = {
  id: string;
  tokenId: string;
  ethereumNetworkId: string;
  tokenType: TOKEN_TYPE['ERC1155'];
  ownerAddress: string;
  address: string;
};

type EthereumNFT = EthereumERC721Token | EthereumERC1155Token;

type CosmosCW20Token = {
  id: string;
  chainId: CosmosChain['id'];
  tokenType: 'CW20';
  address: string;
  name?: string;
  displayDenom: string;
  decimals: number;
  imageURL?: string;
  coinGeckoId?: string;
  default?: boolean;
};

type CosmosToken = CosmosCW20Token;

type EthereumERC20Token = {
  id: string;
  ethereumNetworkId: string;
  tokenType: 'ERC20';
  address: string;
  name?: string;
  displayDenom: string;
  decimals: number;
  imageURL?: string;
  coinGeckoId?: string;
  default?: boolean;
};

type EthereumToken = EthereumERC20Token;

type CosmosNFT = {
  id: string;
  tokenId: string;
  baseChainUUID: string;
  tokenType: 'CW721';
  ownerAddress: string;
  address: string;
};

type Providers = {
  keplr: boolean;
  metamask: boolean;
  aptos: boolean;
};

export type LegacyExtensionStorage = {
  encryptedPassword: string | null;
  accounts: LegacyAccount[];
  accountName: AccountName;
  queues: any[];
  theme: any;
  currency: CurrencyType;
  windowId: number | null;
  additionalChains: Chain[];
  language: LanguageType;
  addressBook: AddressInfo[];

  rootPath: any;
  homeTabIndex: HomeTabPath;

  selectedAccountId: string;

  allowedOrigins: AllowedOrigin[];
  allowedChainIds: string[];

  shownEthereumNetworkIds: string[];
  shownAptosNetworkIds: string[];
  shownSuiNetworkIds: string[];

  selectedChainId: string;

  additionalEthereumNetworks: EthereumNetwork[];
  selectedEthereumNetworkId: any;

  additionalAptosNetworks: any[];
  selectedAptosNetworkId: string;

  additionalSuiNetworks: any[];
  selectedSuiNetworkId: string;

  selectedBitcoinChainId: string;

  cosmosTokens: CosmosToken[];
  ethereumTokens: EthereumToken[];

  ethereumNFTs: EthereumNFT[];
  cosmosNFTs: CosmosNFT[];

  suiPermissions: any[];

  ledgerTransportType: string;

  providers: Providers;

  address: Record<string, string | undefined>;
};

export async function isMigrationRequired_V1_0_0() {
  const legacyStorage = await chrome.storage.local.get<LegacyExtensionStorage>();
  const { accounts } = legacyStorage;

  const isLegacyDataExist = !!accounts && accounts.length > 0;

  const migrationStatus = await getExtensionLocalStorage('migrationStatus');
  const isMigrationComplete = migrationStatus?.['1.0.0'];

  const isMigrationNeeded = isLegacyDataExist && !isMigrationComplete;

  return isMigrationNeeded;
}

export async function skipMigration() {
  const extensionStorageKeys = Object.keys(initialState);
  const shouldDeleteKeys = extensionStorageKeys.filter((key) => !notDeleteKeys.includes(key));

  const resetPromises = shouldDeleteKeys.map((key) => setExtensionLocalStorage(key as ExtensionStorageKeys, initialState[key as ExtensionStorageKeys]));
  await Promise.all(resetPromises);

  await setExtensionLocalStorage('migrationStatus', {
    '1.0.0': true,
  });
}

export async function migrateData() {
  try {
    const isMigrationRequired = await isMigrationRequired_V1_0_0();

    if (!isMigrationRequired) {
      return;
    }

    const paramsV11 = await getExtensionLocalStorage('paramsV11');
    const assetsV11 = await getExtensionLocalStorage('assetsV11');

    if (!paramsV11 || Object.keys(paramsV11).length === 0 || !assetsV11 || assetsV11.length === 0) {
      await v11();
    }
    setLoadingProgressBarStore(25);

    const legacyStorage = await chrome.storage.local.get<LegacyExtensionStorage>();

    if (legacyStorage) {
      await migrateEncryptedPassword(legacyStorage);
      setLoadingProgressBarStore(30);

      await migrateAccounts(legacyStorage);
      setLoadingProgressBarStore(45);

      await migrateAccountNames(legacyStorage);
      setLoadingProgressBarStore(50);

      await migrateCurrency(legacyStorage);

      await migrateAdditionalChains(legacyStorage);

      setLoadingProgressBarStore(55);

      await migrateLanguage(legacyStorage);

      await migrateSelectedAccountId(legacyStorage);

      await migrateAdditionalEVMChains(legacyStorage);

      setLoadingProgressBarStore(60);

      await migrateSelectedEthereumNetworkId();
      await migrateSelectedAptosNetworkId();
      await migrateSelectedSuiNetworkId();

      await migrateSelectedBitcoinNetworkId();

      await migrateProviders(legacyStorage);

      setLoadingProgressBarStore(65);
    }
  } catch (error) {
    console.error('Fail to Migrate', error);

    throw new Error('Fail to Migrate' + error);
  }
}

async function migrateEncryptedPassword(legacyStorage: LegacyExtensionStorage) {
  if (legacyStorage['encryptedPassword']) {
    await setExtensionLocalStorage('comparisonPasswordHash', legacyStorage['encryptedPassword']);
  }
}

async function migrateAccounts(legacyStorage: LegacyExtensionStorage) {
  if (legacyStorage['accounts']) {
    const legacyAccounts = legacyStorage['accounts'];

    const transformedUserAccounts = legacyAccounts
      .map((legacyAccount) => {
        if (legacyAccount.type === ACCOUNT_TYPE.MNEMONIC) {
          const { encryptedMnemonic, encryptedRestoreString, bip44 } = legacyAccount;
          return {
            id: legacyAccount.id,
            type: legacyAccount.type,
            encryptedMnemonic,
            encryptedRestoreString,
            index: bip44.addressIndex,
          } as NewMnemonicAccount;
        }

        if (legacyAccount.type === ACCOUNT_TYPE.PRIVATE_KEY) {
          const { encryptedPrivateKey, encryptedRestoreString } = legacyAccount;
          return {
            id: legacyAccount.id,
            type: legacyAccount.type,
            encryptedPrivateKey,
            encryptedRestoreString,
          } as NewPrivateAccount;
        }

        return null;
      })
      .filter((account): account is NewAccount => !!account);

    await setExtensionLocalStorage('userAccounts', transformedUserAccounts);
  }
}

async function migrateAccountNames(legacyStorage: LegacyExtensionStorage) {
  if (legacyStorage['accountName']) {
    const accountNamesById: AccountNamesById = legacyStorage['accountName'];

    await setExtensionLocalStorage('accountNamesById', accountNamesById);
  }
}

async function migrateCurrency(legacyStorage: LegacyExtensionStorage) {
  const currency = legacyStorage['currency'];
  const newCurrency: NewCurrencyType = (() => {
    if (currency === 'btc' || currency === 'eth') {
      return 'usd';
    }

    return currency;
  })();

  await setExtensionLocalStorage('userCurrencyPreference', newCurrency);
}

async function migrateAdditionalChains(legacyStorage: LegacyExtensionStorage) {
  const legacyAddedCosmosChains = legacyStorage['additionalChains'].filter((chain) => chain.line === 'COSMOS') as CosmosChain[];

  const migratedCosmosChains: CustomCosmosChain[] = legacyAddedCosmosChains.map((legactChain) => {
    const { id, chainId, chainName, baseDenom, bip44, bech32Prefix, type, imageURL, gasRate, gas } = legactChain;

    const pubkeyStyle = type === 'ETHERMINT' ? PUBKEY_STYLE.ethsecp256k1 : PUBKEY_STYLE.secp256k1;

    const newChain: CustomCosmosChain = {
      id,
      chainType: 'cosmos',
      chainId,
      name: chainName,
      image: imageURL || null,
      mainAssetDenom: baseDenom,
      chainDefaultCoinDenoms: [baseDenom],
      accountPrefix: bech32Prefix.address,
      isCosmwasm: false,
      isEvm: false,
      lcdUrls: [{ provider: 'Custom', url: legactChain.restURL }],
      explorer: legactChain.explorerURL ? { name: 'Custom', url: legactChain.explorerURL, account: '', tx: '', proposal: '' } : null,
      feeInfo: {
        isSimulable: false,
        isFeemarketEnabled: false,
        defaultFeeRateKey: '0',
        gasRate: [`${gasRate.tiny || 0.00025}${baseDenom}`, `${gasRate.low || 0.0025}${baseDenom}`, `${gasRate.average || 0.025}${baseDenom}`],
        defaultGasLimit: gas.send || COSMOS_DEFAULT_GAS,
        gasCoefficient: DEFAULT_GAS_MULTIPLY,
      },
      accountTypes: [
        {
          hdPath: `m/44'/${bip44.coinType}/0'/0/\${index}`,
          pubkeyStyle,
          pubkeyType: PUBKEY_TYPE_MAP[pubkeyStyle],
        },
      ],
    };
    return newChain;
  });

  const migratedCosmosAssets: CustomCosmosAsset[] = legacyAddedCosmosChains.map((legactChain) => {
    const { baseDenom, tokenImageURL, id, displayDenom, decimals, coinGeckoId } = legactChain;

    const mainCoin: CustomCosmosAsset = {
      id: baseDenom,
      chainId: id,
      chainType: 'cosmos',
      type: 'native',
      name: displayDenom,
      symbol: displayDenom,
      decimals: decimals || 6,
      image: tokenImageURL || '',
      coinGeckoId: coinGeckoId || '',
    };

    return mainCoin;
  });

  const storedAddedCustomChainList = await getExtensionLocalStorage('addedCustomChainList');

  const nonDuplicateCustomChainList =
    storedAddedCustomChainList?.filter(
      (item) => !migratedCosmosChains.some((newChain) => newChain.id === item.id && item.chainId === newChain.chainId && item.chainType === newChain.chainType),
    ) || [];

  const updatedAddedCustomChainList = [...nonDuplicateCustomChainList, ...migratedCosmosChains];

  await setExtensionLocalStorage('addedCustomChainList', updatedAddedCustomChainList);

  const storedCustomAssets = await getExtensionLocalStorage('customAssets');
  const nonDuplicateCustomAssets =
    storedCustomAssets?.filter(
      (item) => !migratedCosmosAssets.some((newAsset) => newAsset.id === item.id && item.chainId === newAsset.chainId && item.chainType === newAsset.chainType),
    ) || [];

  const updatedCustomAssets = [...nonDuplicateCustomAssets, ...migratedCosmosAssets];
  await setExtensionLocalStorage('customAssets', updatedCustomAssets);
}

async function migrateLanguage(legacyStorage: LegacyExtensionStorage) {
  const language = legacyStorage['language'];
  const newLanguage = (() => {
    if (language === 'ko') {
      return LANGUAGE_TYPE.KO;
    }

    return LANGUAGE_TYPE.EN;
  })();

  await setExtensionLocalStorage('userLanguagePreference', newLanguage);
}

async function migrateSelectedAccountId(legacyStorage: LegacyExtensionStorage) {
  const selectedAccountId = legacyStorage['selectedAccountId'];
  const accountList = await getExtensionLocalStorage('userAccounts');

  const selectedAccount = accountList.find((account) => account.id === selectedAccountId) || accountList[0];
  const newSelectedAccountId = selectedAccount?.id || '';

  await setExtensionLocalStorage('currentAccountId', newSelectedAccountId);
}

async function migrateAdditionalEVMChains(legacyStorage: LegacyExtensionStorage) {
  const legacyAddedEVMChains = legacyStorage['additionalEthereumNetworks'];

  const migratedEvmChains: CustomEvmChain[] = legacyAddedEVMChains.map((legactChain) => {
    const { id, chainId, networkName, imageURL } = legactChain;

    const newChain: CustomEvmChain = {
      id,
      chainId,
      chainType: 'evm',
      name: networkName,
      image: imageURL || null,
      mainAssetDenom: NATIVE_EVM_COIN_ADDRESS,
      chainDefaultCoinDenoms: [NATIVE_EVM_COIN_ADDRESS],
      isCosmos: false,
      rpcUrls: [{ provider: 'Custom', url: legactChain.rpcURL }],
      explorer: { name: 'Custom', url: legactChain.explorerURL || '', account: '', tx: '', proposal: '' },
      feeInfo: {
        isEip1559: false,
        gasCoefficient: 1.3,
      },
      accountTypes: [
        {
          hdPath: `m/44'/60'/0'/0/\${index}`,
          pubkeyStyle: 'keccak256',
          isDefault: null,
        },
      ],
    };
    return newChain;
  });

  const migratedEVMAsset: CustomEvmAsset[] = legacyAddedEVMChains.map((legactChain) => {
    const { tokenImageURL, id, displayDenom, decimals, coinGeckoId } = legactChain;

    const mainCoin: CustomEvmAsset = {
      id: NATIVE_EVM_COIN_ADDRESS,
      chainId: id,
      chainType: 'evm',
      type: 'native',
      name: displayDenom,
      symbol: displayDenom,
      decimals: decimals || 18,
      image: tokenImageURL || '',
      coinGeckoId: coinGeckoId || '',
    };

    return mainCoin;
  });

  const storedAddedCustomChainList = await getExtensionLocalStorage('addedCustomChainList');

  const nonDuplicateCustomChainList =
    storedAddedCustomChainList?.filter(
      (item) => !migratedEvmChains.some((newChain) => newChain.id === item.id && item.chainId === newChain.chainId && item.chainType === newChain.chainType),
    ) || [];

  const updatedAddedCustomChainList = [...nonDuplicateCustomChainList, ...migratedEvmChains];

  await setExtensionLocalStorage('addedCustomChainList', updatedAddedCustomChainList);

  const storedCustomAssets = await getExtensionLocalStorage('customAssets');
  const nonDuplicateCustomAssets =
    storedCustomAssets?.filter(
      (item) => !migratedEVMAsset.some((newAsset) => newAsset.id === item.id && item.chainId === newAsset.chainId && item.chainType === newAsset.chainType),
    ) || [];

  const updatedCustomAssets = [...nonDuplicateCustomAssets, ...migratedEVMAsset];
  await setExtensionLocalStorage('customAssets', updatedCustomAssets);
}

async function migrateSelectedEthereumNetworkId() {
  const { evmChains } = await getChains();

  if (evmChains.length === 0) {
    await setExtensionLocalStorage('chosenEthereumNetworkId', '');

    return;
  }

  const defaultEVMNetwork = evmChains.find((item) => item.id === 'ethereum') || evmChains[0];

  const defaultEVMNetworkId = getUniqueChainId(defaultEVMNetwork);
  await setExtensionLocalStorage('chosenEthereumNetworkId', defaultEVMNetworkId);
}

async function migrateSelectedAptosNetworkId() {
  const { aptosChains } = await getChains();

  if (aptosChains.length === 0) {
    await setExtensionLocalStorage('chosenAptosNetworkId', '');

    return;
  }

  const defaultAptosNetwork = aptosChains.find((item) => item.id === 'aptos') || aptosChains[0];

  const defaultAptosNetworkId = getUniqueChainId(defaultAptosNetwork);

  await setExtensionLocalStorage('chosenAptosNetworkId', defaultAptosNetworkId);
}

async function migrateSelectedSuiNetworkId() {
  const { suiChains } = await getChains();

  if (suiChains.length === 0) {
    await setExtensionLocalStorage('chosenSuiNetworkId', '');

    return;
  }

  const defaultSuiNetwork = suiChains.find((item) => item.id === 'sui') || suiChains[0];

  const defaultSuiNetworkId = getUniqueChainId(defaultSuiNetwork);

  await setExtensionLocalStorage('chosenSuiNetworkId', defaultSuiNetworkId);
}

async function migrateSelectedBitcoinNetworkId() {
  const { bitcoinChains } = await getChains();

  if (bitcoinChains.length === 0) {
    await setExtensionLocalStorage('chosenBitcoinNetworkId', '');

    return;
  }

  const defaultBitcoinNetwork = bitcoinChains.find((item) => item.id === 'bitcoin') || bitcoinChains[0];

  const defaultBitcoinNetworkId = getUniqueChainId(defaultBitcoinNetwork);

  await setExtensionLocalStorage('chosenBitcoinNetworkId', defaultBitcoinNetworkId);
}

async function migrateProviders(legacyStorage: LegacyExtensionStorage) {
  const providers = legacyStorage['providers'];

  const newProviders: PrioritizedProvider = {
    keplr: providers.keplr,
    metamask: providers.metamask,
    aptos: providers.aptos,
  };

  await setExtensionLocalStorage('prioritizedProvider', newProviders);
}
