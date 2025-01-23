import type {
  Account,
  AccountAddress,
  AccountAddressBalanceAptos,
  AccountAddressBalanceBitcoin,
  AccountAddressBalanceCosmos,
  AccountAddressBalanceCw20,
  AccountAddressBalanceErc20,
  AccountAddressBalanceEvm,
  AccountAddressBalanceSui,
  AccountNamesById,
  MnemonicNamesByHashedMnemonic,
  PreferAccountType,
} from './account';
import type { V11Asset, V11Param } from './apiV11';
import type { AssetId, CosmosCw20Asset, CustomAsset, EvmErc20Asset } from './asset';
import type { CustomChain, UniqueChainId } from './chain';
import type { CurrencyType } from './currency';
import type { Password } from './password';
import type { DappListSortKeyType, DashboardCoinSortKeyType } from './sortKey';

export type AddressInfo = {
  id: string;
  chainId: UniqueChainId;
  label: string;
  address: string;
  memo?: string;
};

export type ApprovedOrigin = { accountId: Account['id']; origin: string };

export interface ExtensionStorage {
  accounts: Account[];
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
  [key: `${string}-balance-erc20`]: AccountAddressBalanceErc20[];
  [key: `${string}-balance-cw20`]: AccountAddressBalanceCw20[];
  [key: `${string}-hidden-assetIds`]: AssetId[];
  [key: `${string}-visible-assetIds`]: AssetId[];
  [key: `${string}-custom-address`]: AccountAddress[];
  [key: `${string}-custom-balance-erc20`]: AccountAddressBalanceErc20[];
  [key: `${string}-custom-balance-cw20`]: AccountAddressBalanceCw20[];
  [key: `${string}-custom-balance-cosmos`]: AccountAddressBalanceCosmos[];
  [key: `${string}-custom-balance-evm`]: AccountAddressBalanceEvm[];
  initAccountIds: Account['id'][];
  initCheckLegacyBalanceAccountIds: Account['id'][];
  dashboardCoinSortKey: DashboardCoinSortKeyType;
  dappListSortKey: DappListSortKeyType;
  language: string;
  comparisonPasswordHash: string;
  accountNamesById: AccountNamesById;
  mnemonicNamesByHashedMnemonic: MnemonicNamesByHashedMnemonic;
  selectedAccountId: Account['id'];
  notBackedUpAccountIds: Account['id'][];
  currency: CurrencyType;
  preferAccountType: PreferAccountType;
  addressBookList: AddressInfo[];
  addedCustomChainList: CustomChain[];
  customAssets: CustomAsset[];
  customHiddenAssetIds: AssetId[];
  approvedOrigins: ApprovedOrigin[];
}

export type ExtensionStorageKeys = keyof ExtensionStorage;

export interface ExtensionSessionStorage {
  password: Password | null;
}

export type ExtensionSessionStorageKeys = keyof ExtensionSessionStorage;
