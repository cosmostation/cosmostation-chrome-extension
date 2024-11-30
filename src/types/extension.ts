import type {
  Account,
  AccountAddress,
  AccountAddressBalanceAptos,
  AccountAddressBalanceCosmos,
  AccountAddressBalanceCw20,
  AccountAddressBalanceErc20,
  AccountAddressBalanceEvm,
  AccountAddressBalanceSui,
  AccountNamesById,
  MnemonicNamesByHashedMnemonic,
} from './account';
import type { V11Asset, V11Param } from './apiV11';
import type { AssetId, CosmosCw20Asset, EvmErc20Asset } from './asset';
import type { Password } from './password';
import type { DappListSortKeyType, DashboardCoinSortKeyType } from './sortKey';

export interface ExtensionStorage {
  accounts: Account[];
  paramsV11: Record<string, V11Param>;
  assetsV11: V11Asset[];
  erc20Assets: EvmErc20Asset[];
  cw20Assets: CosmosCw20Asset[];
  [key: `${string}-address`]: AccountAddress[];
  [key: `${string}-balance-cosmos`]: AccountAddressBalanceCosmos[];
  [key: `${string}-balance-evm`]: AccountAddressBalanceEvm[];
  [key: `${string}-balance-aptos`]: AccountAddressBalanceAptos[];
  [key: `${string}-balance-sui`]: AccountAddressBalanceSui[];
  [key: `${string}-balance-erc20`]: AccountAddressBalanceErc20[];
  [key: `${string}-balance-cw20`]: AccountAddressBalanceCw20[];
  [key: `${string}-hidden-assetIds`]: AssetId[];
  initAccountIds: Account['id'][];
  dashboardCoinSortKey: DashboardCoinSortKeyType;
  dappListSortKey: DappListSortKeyType;
  language: string;
  // 복호화 가능한 패스워드 정보는 이렇게 저장해도 되나?
  password: Password;

  // NOTE Lock에서 입력한 패스워드가 맞는지 확인하기 위해 사용하는 값
  comparisonPasswordHash: string;

  accountNamesById: AccountNamesById;
  mnemonicNamesByHashedMnemonic: MnemonicNamesByHashedMnemonic;
}

export type ExtensionStorageKeys = keyof ExtensionStorage;
