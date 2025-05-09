import type {
  AccountAptosAsset,
  AccountBitcoinAsset,
  AccountCosmosAsset,
  AccountCustomCosmosAsset,
  AccountCustomEvmAsset,
  AccountCw20Asset,
  AccountErc20Asset,
  AccountEvmAsset,
  AccountIotaAsset,
  AccountSuiAsset,
} from './account';

export interface AccountAssets {
  cosmosAccountAssets: AccountCosmosAsset[];
  evmAccountAssets: AccountEvmAsset[];
  aptosAccountAssets: AccountAptosAsset[];
  suiAccountAssets: AccountSuiAsset[];
  bitcoinAccountAssets: AccountBitcoinAsset[];
  iotaAccountAssets: AccountIotaAsset[];
  cw20AccountAssets: AccountCw20Asset[];
  erc20AccountAssets: AccountErc20Asset[];
  customErc20AccountAssets: AccountErc20Asset[];
  customCw20AccountAssets: AccountCw20Asset[];
  cosmosAccountCustomAssets: AccountCustomCosmosAsset[];
  evmAccountCustomAssets: AccountCustomEvmAsset[];
}

export type FlatAccountAssets =
  | AccountCosmosAsset
  | AccountCw20Asset
  | AccountErc20Asset
  | AccountEvmAsset
  | AccountSuiAsset
  | AccountBitcoinAsset
  | AccountIotaAsset
  | AccountAptosAsset
  | AccountCustomCosmosAsset
  | AccountCustomEvmAsset;

export type AllCosmosAccountAssets = AccountCosmosAsset | AccountCustomCosmosAsset | AccountCw20Asset;

export type AllEVMAccountAssets = AccountEvmAsset | AccountCustomEvmAsset | AccountErc20Asset;

export interface AccountCustomAssets {
  cosmosAccountCustomAssets: AccountCustomCosmosAsset[];
  evmAccountCustomAssets: AccountCustomEvmAsset[];
}

export type FlatAccountCustomAssets = AccountCustomCosmosAsset | AccountCustomEvmAsset;

export type SingleOrGroupAccountAssets = FlatAccountAssets & {
  totalDisplayAmount: string;
  counts: string;
};
