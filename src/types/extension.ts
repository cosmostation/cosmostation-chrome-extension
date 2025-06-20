import type { PERMISSION as IOTA_PERMISSION } from '@/constants/iota';
import type { PERMISSION } from '@/constants/sui';

import type {
  Account,
  AccountAddress,
  AccountAddressAccountInfoCosmos,
  AccountAddressBalanceAptos,
  AccountAddressBalanceBitcoin,
  AccountAddressBalanceCosmos,
  AccountAddressBalanceCw20,
  AccountAddressBalanceErc20,
  AccountAddressBalanceEvm,
  AccountAddressBalanceIota,
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
import type { AssetId, CosmosCw20Asset, CustomAsset, EvmErc20Asset } from './asset';
import type { LockupTimeOptions } from './autoLock';
import type { CustomChain, UniqueChainId } from './chain';
import type { CurrencyType } from './currency';
import type { LanguageType } from './language';
import type { Request } from './message/inject';
import type { CosmosNFT, EvmNFT, SuiNFT } from './nft';
import type { Password } from './password';
import type { PriceTrendType } from './price';
import type { ChainlistSortKeyType, DappListSortKeyType, DashboardCoinSortKeyType } from './sortKey';

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
  isVisiable: boolean;
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

export interface ExtensionStorage {
  userAccounts: Account[];
  paramsV11: Record<string, V11Param>;
  assetsV11: V11Asset[];
  erc20Assets: EvmErc20Asset[];
  customErc20Assets: EvmErc20Asset[];
  cw20Assets: CosmosCw20Asset[];
  customCw20Assets: CosmosCw20Asset[];
  [key: `${string}-address`]: AccountAddress[];
  [key: `${string}-balance-cosmos`]: AccountAddressBalanceCosmos[];
  [key: `${string}-balance-evm`]: AccountAddressBalanceEvm[];
  [key: `${string}-balance-aptos`]: AccountAddressBalanceAptos[];
  [key: `${string}-balance-sui`]: AccountAddressBalanceSui[];
  [key: `${string}-balance-bitcoin`]: AccountAddressBalanceBitcoin[];
  [key: `${string}-balance-iota`]: AccountAddressBalanceIota[];
  [key: `${string}-balance-erc20`]: AccountAddressBalanceErc20[];
  [key: `${string}-balance-cw20`]: AccountAddressBalanceCw20[];
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
  initAccountIds: Account['id'][];
  initCheckLegacyBalanceAccountIds: Account['id'][];
  dashboardCoinSortKey: DashboardCoinSortKeyType;
  dappListSortKey: DappListSortKeyType;
  chainListSortKey: ChainlistSortKeyType;
  userLanguagePreference: LanguageType;
  comparisonPasswordHash: string;
  accountNamesById: AccountNamesById;
  mnemonicNamesByHashedMnemonic: MnemonicNamesByHashedMnemonic;
  currentAccountId: Account['id'];
  notBackedUpAccountIds: Account['id'][];
  userCurrencyPreference: CurrencyType;
  preferAccountType: PreferAccountType;
  addressBookList: AddressInfo[];
  addedCustomChainList: CustomChain[];
  customAssets: CustomAsset[];
  customHiddenAssetIds: AssetId[];
  approvedOrigins: ApprovedOrigin[];
  adPopoverState: AdPopoverStateMap;
  isBalanceVisible: boolean;
  isHideSmalValue: boolean;
  approvedSuiPermissions: ApprovedSuiPermission[];
  approvedIotaPermissions: ApprovedIotaPermission[];
  requestQueue: RequestQueue[];
  chosenEthereumNetworkId: string;
  chosenAptosNetworkId: string;
  chosenSuiNetworkId: string;
  chosenBitcoinNetworkId: string;
  chosenIotaNetworkId: string;
  currentWindowId: number | null;
  prioritizedProvider: PrioritizedProvider;
  pinnedDappIds: number[];
  autoLockTimeInMinutes: LockupTimeOptions;
  autoLockTimeStampAt: number | null;
  migrationStatus: MigrationStatus | null;
  userPriceTrendPreference: PriceTrendType;
  selectedChainFilterId: UniqueChainId | null;
}

export type ExtensionStorageKeys = keyof ExtensionStorage;

export interface ExtensionSessionStorage {
  sessionPassword: Password | null;
}

export type ExtensionSessionStorageKeys = keyof ExtensionSessionStorage;
