import type { PERMISSION as IOTA_PERMISSION } from '@/constants/iota';
import type { PERMISSION } from '@/constants/sui';
import type { RATE_LIMIT_MS } from '@/constants/updateRequest';

import type {
  Account,
  AccountAddress,
  AccountAddressAccountInfoCosmos,
  AccountAddressBalanceAptos,
  AccountAddressBalanceAptosV2,
  AccountAddressBalanceBitcoin,
  AccountAddressBalanceCosmos,
  AccountAddressBalanceCw20,
  AccountAddressBalanceErc20,
  AccountAddressBalanceEvm,
  AccountAddressBalanceGno,
  AccountAddressBalanceGrc20,
  AccountAddressBalanceIota,
  AccountAddressBalanceSolana,
  AccountAddressBalanceSplToken,
  AccountAddressBalanceSui,
  AccountAddressCommissionsCosmos,
  AccountAddressDelegationsCosmos,
  AccountAddressDelegationsIota,
  AccountAddressDelegationsSui,
  AccountAddressLockedBalanceCosmos,
  AccountAddressRewardsCosmos,
  AccountAddressUnbondingsCosmos,
  AccountNamesById,
  MnemonicNamesByHashedMnemonic,
  PreferAccountType,
} from './account';
import type { V11Asset, V11Param } from './apiV11';
import type { AssetId, CosmosCw20Asset, CustomAsset, EvmErc20Asset, GnoGrc20Asset, SolanaSpltokenAsset } from './asset';
import type { LockupTimeOptions } from './autoLock';
import type { CustomChain, UniqueChainId } from './chain';
import type { CurrencyType } from './currency';
import type { LanguageType } from './language';
import type { Request } from './message/inject';
import type { CosmosNFT, EvmNFT, SuiNFT } from './nft';
import type { Password } from './password';
import type { PriceTrendType } from './price';
import type { ChainlistSortKeyType, DappListSortKeyType, DashboardCoinSortKeyType } from './sortKey';
import type { ViewPreferenceType } from './userPreference/view';

export type ApprovedSuiPermissionType = ValueOf<typeof PERMISSION>;
export type ApprovedIotaPermissionType = ValueOf<typeof IOTA_PERMISSION>;

export type AddressInfo = {
  id: string;
  chainId: UniqueChainId;
  label: string;
  address: string;
  memo?: string;
};

export type ApprovedOrigin = { accountId: Account['id']; origin: string; lastConnectedAt: number; txCount: number };

export type AdPopoverState = {
  lastClosed?: number;
};
export type AdPopoverStateMap = Record<string, AdPopoverState>;

export type ApprovedSuiPermission = {
  id: string;
  origin: ApprovedOrigin['origin'];
  accountId: Account['id'];
  permission: ApprovedSuiPermissionType;
  lastConnectedAt: number;
};

export type ApprovedIotaPermission = {
  id: string;
  origin: ApprovedOrigin['origin'];
  accountId: Account['id'];
  permission: ApprovedIotaPermissionType;
  lastConnectedAt: number;
};

export type RequestQueue = Request & {
  windowId?: number;
};

export type PrioritizedProvider = {
  keplr: boolean;
  metamask: boolean;
  aptos: boolean;
};

export type MigrationStatus = Record<string, boolean>;

type RateLimitedMethod = keyof typeof RATE_LIMIT_MS;
export type LastRequestTimestampsKey = `${RateLimitedMethod}:${string}`;

type LastRequestTimestamps = Record<LastRequestTimestampsKey, number>;

export interface DefaultExtensionStorage {
  paramsV11: Record<string, V11Param>;
  assetsV11: V11Asset[];
  userCurrencyPreference: CurrencyType;
  userPriceTrendPreference: PriceTrendType;
  dappListSortKey: DappListSortKeyType;
  dashboardCoinSortKey: DashboardCoinSortKeyType;
  chainListSortKey: ChainlistSortKeyType;
  userAccounts: Account[];
  accountNamesById: AccountNamesById;
  mnemonicNamesByHashedMnemonic: MnemonicNamesByHashedMnemonic;
  notBackedUpAccountIds: Account['id'][];
  preferAccountType: PreferAccountType;
  customErc20Assets: EvmErc20Asset[];
  customCw20Assets: CosmosCw20Asset[];
  addressBookList: AddressInfo[];
  addedCustomChainList: CustomChain[];
  customAssets: CustomAsset[];
  customHiddenAssetIds: AssetId[];
  approvedOrigins: ApprovedOrigin[];
  requestQueue: RequestQueue[];
  approvedSuiPermissions: ApprovedSuiPermission[];
  approvedIotaPermissions: ApprovedIotaPermission[];
  initCheckLegacyBalanceAccountIds: Account['id'][];
  isBalanceVisible: boolean;
  isHideSmalValue: boolean;
  adPopoverState: AdPopoverStateMap;
  currentWindowId: number | null;
  prioritizedProvider: PrioritizedProvider;
  pinnedDappIds: number[];
  autoLockTimeInMinutes: LockupTimeOptions;
}

export interface StoragePreferences {
  userCurrencyPreference: CurrencyType;
  userPriceTrendPreference: PriceTrendType;
  userLanguagePreference: LanguageType;
  dappListSortKey: DappListSortKeyType;
  dashboardCoinSortKey: DashboardCoinSortKeyType;
  chainListSortKey: ChainlistSortKeyType;
  isBalanceVisible: boolean;
  isHideSmalValue: boolean;
  autoLockTimeInMinutes: LockupTimeOptions;
  userViewPreference?: ViewPreferenceType;
}

export interface StorageAccounts {
  userAccounts: Account[];
  accountNamesById: AccountNamesById;
  mnemonicNamesByHashedMnemonic: MnemonicNamesByHashedMnemonic;
  notBackedUpAccountIds: Account['id'][];
  preferAccountType: PreferAccountType;
}

export interface StorageNetworks {
  chosenEthereumNetworkId: string;
  chosenAptosNetworkId: string;
  chosenSuiNetworkId: string;
  chosenBitcoinNetworkId: string;
  chosenIotaNetworkId: string;
  chosenSolanaNetworkId: string;
  chosenGnoNetworkId: string;
  selectedChainFilterId: UniqueChainId | null;
  addedCustomChainList: CustomChain[];
}

export interface StorageAssets {
  customErc20Assets: EvmErc20Asset[];
  customCw20Assets: CosmosCw20Asset[];
  customAssets: CustomAsset[];
  customHiddenAssetIds: AssetId[];
}

export interface StorageDApps {
  approvedOrigins: ApprovedOrigin[];
  approvedSuiPermissions: ApprovedSuiPermission[];
  approvedIotaPermissions: ApprovedIotaPermission[];
  pinnedDappIds: number[];
  prioritizedProvider: PrioritizedProvider;
}

export interface StorageContacts {
  addressBookList: AddressInfo[];
}

export interface StorageSecurity {
  comparisonPasswordHash: string;
}

export interface StorageState {
  currentAccountId: Account['id'];
  initAccountIds: Account['id'][];
  initCheckLegacyBalanceAccountIds: Account['id'][];
  requestQueue: RequestQueue[];
  adPopoverState: AdPopoverStateMap;
  currentWindowId: number | null;
  autoLockTimeStampAt: number | null;
  migrationStatus: MigrationStatus | null;
  lastRequestTimestamps: LastRequestTimestamps | null;
  bugFix?: Record<string, boolean>;
  dismissedAdIds?: string[];
}

export interface StoreSyncedStorage
  extends StoragePreferences,
    StorageAccounts,
    StorageNetworks,
    StorageAssets,
    StorageDApps,
    StorageContacts,
    StorageSecurity,
    StorageState {}

export type StoreSyncedStorageKeys = keyof StoreSyncedStorage;

export interface ExtensionStorage extends StoreSyncedStorage {
  paramsV11: Record<string, V11Param>;
  assetsV11: V11Asset[];
  erc20Assets: EvmErc20Asset[];
  cw20Assets: CosmosCw20Asset[];
  spltokenAssets: SolanaSpltokenAsset[];
  grc20Assets: GnoGrc20Asset[];
  [key: `${string}-address`]: AccountAddress[];
  [key: `${string}-balance-cosmos`]: AccountAddressBalanceCosmos[];
  [key: `${string}-balance-evm`]: AccountAddressBalanceEvm[];
  [key: `${string}-balance-aptos`]: AccountAddressBalanceAptos[];
  [key: `${string}-balance-aptos-v2`]: AccountAddressBalanceAptosV2[];
  [key: `${string}-balance-sui`]: AccountAddressBalanceSui[];
  [key: `${string}-balance-bitcoin`]: AccountAddressBalanceBitcoin[];
  [key: `${string}-balance-iota`]: AccountAddressBalanceIota[];
  [key: `${string}-balance-solana`]: AccountAddressBalanceSolana[];
  [key: `${string}-balance-gno`]: AccountAddressBalanceGno[];
  [key: `${string}-balance-erc20`]: AccountAddressBalanceErc20[];
  [key: `${string}-balance-cw20`]: AccountAddressBalanceCw20[];
  [key: `${string}-balance-spltoken`]: AccountAddressBalanceSplToken[];
  [key: `${string}-balance-grc20`]: AccountAddressBalanceGrc20[];
  [key: `${string}-delegation-cosmos`]: AccountAddressDelegationsCosmos[];
  [key: `${string}-undelegation-cosmos`]: AccountAddressUnbondingsCosmos[];
  [key: `${string}-reward-cosmos`]: AccountAddressRewardsCosmos[];
  [key: `${string}-commission-cosmos`]: AccountAddressCommissionsCosmos[];
  [key: `${string}-locked-cosmos`]: AccountAddressLockedBalanceCosmos[];
  [key: `${string}-account-info-cosmos`]: AccountAddressAccountInfoCosmos[];
  [key: `${string}-delegation-sui`]: AccountAddressDelegationsSui[];
  [key: `${string}-delegation-iota`]: AccountAddressDelegationsIota[];
  [key: `${string}-hidden-assetIds`]: AssetId[];
  [key: `${string}-visible-assetIds`]: AssetId[];
  [key: `${string}-custom-address`]: AccountAddress[];
  [key: `${string}-custom-balance-erc20`]: AccountAddressBalanceErc20[];
  [key: `${string}-custom-balance-cw20`]: AccountAddressBalanceCw20[];
  [key: `${string}-custom-balance-cosmos`]: AccountAddressBalanceCosmos[];
  [key: `${string}-custom-balance-evm`]: AccountAddressBalanceEvm[];
  [key: `${string}-nft-evm`]: EvmNFT[];
  [key: `${string}-nft-cosmos`]: CosmosNFT[];
  [key: `${string}-nft-sui`]: SuiNFT[];
  [key: `${string}-nft-iota`]: SuiNFT[];
}

export type ExtensionStorageKeys = keyof ExtensionStorage;

export interface ExtensionSessionStorage {
  sessionPassword: Password | null;
}

export type ExtensionSessionStorageKeys = keyof ExtensionSessionStorage;
